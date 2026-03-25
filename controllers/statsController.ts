import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return res.status(400).json({
        message: 'Invalid project ID'
      });
    }

    // Get basic project stats
    const projectQuery = `
      SELECT 
        p.id,
        p.name,
        p.created_at,
        COUNT(DISTINCT s.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN s.status = 'pending' THEN s.id END) as pending_submissions,
        COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END) as approved_submissions,
        COUNT(DISTINCT CASE WHEN s.status = 'rejected' THEN s.id END) as rejected_submissions,
        COUNT(DISTINCT c.id) as total_comments,
        COUNT(DISTINCT r.id) as total_reviews,
        COUNT(DISTINCT pu.user_id) as total_collaborators
      FROM projects p
      LEFT JOIN submissions s ON p.id = s.project_id
      LEFT JOIN comments c ON s.id = c.submission_id
      LEFT JOIN reviews r ON s.id = r.submission_id
      LEFT JOIN project_users pu ON p.id = pu.project_id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.created_at
    `;

    const projectResult = await pool.query(projectQuery, [projectId]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    const stats = projectResult.rows[0];

    // Get submission trends (last 30 days)
    const trendsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as submissions
      FROM submissions
      WHERE project_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const trendsResult = await pool.query(trendsQuery, [projectId]);

    // Get top contributors
    const contributorsQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(s.id) as submission_count,
        COUNT(c.id) as comment_count,
        COUNT(r.id) as review_count
      FROM users u
      LEFT JOIN submissions s ON u.id = s.user_id AND s.project_id = $1
      LEFT JOIN comments c ON u.id = c.user_id
      LEFT JOIN submissions s2 ON c.submission_id = s2.id AND s2.project_id = $1
      LEFT JOIN reviews r ON u.id = r.reviewer_id
      LEFT JOIN submissions s3 ON r.submission_id = s3.id AND s3.project_id = $1
      WHERE u.id IN (
        SELECT DISTINCT user_id FROM submissions WHERE project_id = $1
        UNION
        SELECT DISTINCT user_id FROM project_users WHERE project_id = $1
      )
      GROUP BY u.id, u.name, u.email
      ORDER BY (submission_count + comment_count + review_count) DESC
      LIMIT 10
    `;

    const contributorsResult = await pool.query(contributorsQuery, [projectId]);

    // Get recent activity
    const activityQuery = `
      SELECT 
        'submission' as type,
        s.title,
        u.name as user_name,
        s.created_at
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      WHERE s.project_id = $1
      
      UNION ALL
      
      SELECT 
        'comment' as type,
        SUBSTRING(c.content, 1, 50) as title,
        u.name as user_name,
        c.created_at
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN submissions s ON c.submission_id = s.id
      WHERE s.project_id = $1
      
      UNION ALL
      
      SELECT 
        'review' as type,
        CASE r.status 
          WHEN 'approved' THEN 'Approved submission'
          WHEN 'changes_requested' THEN 'Requested changes'
          ELSE 'Review submitted'
        END as title,
        u.name as user_name,
        r.created_at
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN submissions s ON r.submission_id = s.id
      WHERE s.project_id = $1
      
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const activityResult = await pool.query(activityQuery, [projectId]);

    res.json({
      project: {
        id: stats.id,
        name: stats.name,
        created_at: stats.created_at,
        total_submissions: parseInt(stats.total_submissions),
        pending_submissions: parseInt(stats.pending_submissions),
        approved_submissions: parseInt(stats.approved_submissions),
        rejected_submissions: parseInt(stats.rejected_submissions),
        total_comments: parseInt(stats.total_comments),
        total_reviews: parseInt(stats.total_reviews),
        total_collaborators: parseInt(stats.total_collaborators)
      },
      trends: trendsResult.rows,
      top_contributors: contributorsResult.rows,
      recent_activity: activityResult.rows
    });
  } catch (error: any) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({
      message: 'Failed to fetch project statistics',
      error: error.message
    });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    // Get user's overall stats
    const userStatsQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(DISTINCT s.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END) as approved_submissions,
        COUNT(DISTINCT c.id) as total_comments,
        COUNT(DISTINCT r.id) as total_reviews,
        COUNT(DISTINCT pu.project_id) as projects_contributed
      FROM users u
      LEFT JOIN submissions s ON u.id = s.user_id
      LEFT JOIN comments c ON u.id = c.user_id
      LEFT JOIN reviews r ON u.id = r.reviewer_id
      LEFT JOIN project_users pu ON u.id = pu.user_id
      WHERE u.id = $1
      GROUP BY u.id, u.name, u.email
    `;

    const userStatsResult = await pool.query(userStatsQuery, [userId]);

    // Get user's recent activity
    const recentActivityQuery = `
      SELECT 
        'submission' as type,
        s.title,
        p.name as project_name,
        s.created_at
      FROM submissions s
      JOIN projects p ON s.project_id = p.id
      WHERE s.user_id = $1
      
      UNION ALL
      
      SELECT 
        'comment' as type,
        SUBSTRING(c.content, 1, 50) as title,
        p.name as project_name,
        c.created_at
      FROM comments c
      JOIN submissions s ON c.submission_id = s.id
      JOIN projects p ON s.project_id = p.id
      WHERE c.user_id = $1
      
      UNION ALL
      
      SELECT 
        'review' as type,
        CASE r.status 
          WHEN 'approved' THEN 'Approved submission'
          WHEN 'changes_requested' THEN 'Requested changes'
          ELSE 'Review submitted'
        END as title,
        p.name as project_name,
        r.created_at
      FROM reviews r
      JOIN submissions s ON r.submission_id = s.id
      JOIN projects p ON s.project_id = p.id
      WHERE r.reviewer_id = $1
      
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const recentActivityResult = await pool.query(recentActivityQuery, [userId]);

    // Get user's project breakdown
    const projectBreakdownQuery = `
      SELECT 
        p.id,
        p.name,
        COUNT(DISTINCT s.id) as submissions,
        COUNT(DISTINCT c.id) as comments,
        COUNT(DISTINCT r.id) as reviews
      FROM projects p
      LEFT JOIN project_users pu ON p.id = pu.project_id AND pu.user_id = $1
      LEFT JOIN submissions s ON p.id = s.project_id AND s.user_id = $1
      LEFT JOIN comments c ON s.id = c.submission_id AND c.user_id = $1
      LEFT JOIN reviews r ON s.id = r.submission_id AND r.reviewer_id = $1
      WHERE pu.user_id = $1 OR s.user_id = $1 OR c.user_id = $1 OR r.reviewer_id = $1
      GROUP BY p.id, p.name
      ORDER BY (submissions + comments + reviews) DESC
    `;

    const projectBreakdownResult = await pool.query(projectBreakdownQuery, [userId]);

    const stats = userStatsResult.rows[0];

    res.json({
      user: {
        id: stats.id,
        name: stats.name,
        email: stats.email,
        total_submissions: parseInt(stats.total_submissions),
        approved_submissions: parseInt(stats.approved_submissions),
        total_comments: parseInt(stats.total_comments),
        total_reviews: parseInt(stats.total_reviews),
        projects_contributed: parseInt(stats.projects_contributed)
      },
      recent_activity: recentActivityResult.rows,
      project_breakdown: projectBreakdownResult.rows
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};
