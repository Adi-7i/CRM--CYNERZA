"""
Analytics and dashboard service with optimized aggregation queries.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, case, extract
from typing import Optional, Dict
from datetime import datetime, date
from decimal import Decimal
from collections import defaultdict

from app.models.user import User, UserRole
from app.models.lead import Lead, LeadStatus, LeadSource
from app.models.customer import Customer
from app.models.deal import Deal, DealStage
from app.models.task import Task, TaskStatus, TaskPriority, RelatedEntityType
from app.schemas.analytics import (
    DashboardOverview,
    LeadAnalytics,
    DealAnalytics,
    SalesPerformance,
    UserPerformance,
    TaskAnalytics
)


def get_dashboard_overview(
    db: Session,
    current_user: User,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> DashboardOverview:
    """
    Get dashboard overview with key metrics.
    
    Args:
        db: Database session
        current_user: Current user (for RBAC filtering)
        start_date: Optional start date filter
        end_date: Optional end date filter
        
    Returns:
        DashboardOverview with aggregated metrics
    """
    # Apply RBAC filtering
    is_sales = current_user.role == UserRole.SALES
    user_filter = current_user.id if is_sales else None
    
    # Lead metrics
    lead_query = db.query(Lead)
    if start_date:
        lead_query = lead_query.filter(Lead.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        lead_query = lead_query.filter(Lead.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        lead_query = lead_query.filter(Lead.assigned_to_id == user_filter)
    
    total_leads = lead_query.count()
    active_leads = lead_query.filter(Lead.status.notin_([LeadStatus.WON, LeadStatus.LOST])).count()
    
    # Customer metrics
    customer_query = db.query(Customer)
    if start_date:
        customer_query = customer_query.filter(Customer.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        customer_query = customer_query.filter(Customer.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        customer_query = customer_query.filter(Customer.assigned_to_id == user_filter)
    
    total_customers = customer_query.count()
    converted_customers = customer_query.filter(Customer.lead_id.isnot(None)).count()
    
    # Deal metrics
    deal_query = db.query(Deal)
    if start_date:
        deal_query = deal_query.filter(Deal.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        deal_query = deal_query.filter(Deal.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        deal_query = deal_query.filter(Deal.owner_id == user_filter)
    
    total_deals = deal_query.count()
    won_deals = deal_query.filter(Deal.stage == DealStage.CLOSED_WON).count()
    lost_deals = deal_query.filter(Deal.stage == DealStage.CLOSED_LOST).count()
    active_deals = deal_query.filter(Deal.stage.notin_([DealStage.CLOSED_WON, DealStage.CLOSED_LOST])).count()
    
    # Revenue metrics
    total_revenue = db.query(func.sum(Deal.value)).filter(
        Deal.stage == DealStage.CLOSED_WON
    )
    if start_date:
        total_revenue = total_revenue.filter(Deal.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        total_revenue = total_revenue.filter(Deal.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        total_revenue = total_revenue.filter(Deal.owner_id == user_filter)
    total_revenue = total_revenue.scalar() or Decimal(0)
    
    # Pipeline value (active deals)
    pipeline_value = db.query(func.sum(Deal.value)).filter(
        Deal.stage.notin_([DealStage.CLOSED_WON, DealStage.CLOSED_LOST])
    )
    if start_date:
        pipeline_value = pipeline_value.filter(Deal.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        pipeline_value = pipeline_value.filter(Deal.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        pipeline_value = pipeline_value.filter(Deal.owner_id == user_filter)
    pipeline_value = pipeline_value.scalar() or Decimal(0)
    
    # Weighted pipeline
    active_deals_list = deal_query.filter(Deal.stage.notin_([DealStage.CLOSED_WON, DealStage.CLOSED_LOST])).all()
    weighted_pipeline = sum(deal.weighted_value for deal in active_deals_list)
    
    # Task metrics
    task_query = db.query(Task)
    if start_date:
        task_query = task_query.filter(Task.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        task_query = task_query.filter(Task.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        task_query = task_query.filter(Task.assigned_to_id == user_filter)
    
    active_tasks = task_query.filter(Task.status == TaskStatus.PENDING).count()
    overdue_tasks = task_query.filter(Task.status == TaskStatus.OVERDUE).count()
    
    return DashboardOverview(
        total_leads=total_leads,
        active_leads=active_leads,
        converted_customers=converted_customers,
        total_customers=total_customers,
        total_deals=total_deals,
        won_deals=won_deals,
        lost_deals=lost_deals,
        active_deals=active_deals,
        total_revenue=total_revenue,
        pipeline_value=pipeline_value,
        weighted_pipeline=weighted_pipeline,
        active_tasks=active_tasks,
        overdue_tasks=overdue_tasks
    )


def get_lead_analytics(
    db: Session,
    current_user: User,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> LeadAnalytics:
    """
    Get lead analytics with distributions.
    """
    is_sales = current_user.role == UserRole.SALES
    user_filter = current_user.id if is_sales else None
    
    lead_query = db.query(Lead)
    if start_date:
        lead_query = lead_query.filter(Lead.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        lead_query = lead_query.filter(Lead.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        lead_query = lead_query.filter(Lead.assigned_to_id == user_filter)
    
    total_leads = lead_query.count()
    
    # Conversion rate
    converted_count = db.query(Customer).filter(Customer.lead_id.isnot(None))
    if user_filter:
        converted_count = converted_count.filter(Customer.assigned_to_id == user_filter)
    converted_count = converted_count.count()
    
    conversion_rate = (converted_count / total_leads * 100) if total_leads > 0 else 0.0
    
    # Source distribution
    source_dist = db.query(Lead.source, func.count(Lead.id)).group_by(Lead.source)
    if start_date:
        source_dist = source_dist.filter(Lead.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        source_dist = source_dist.filter(Lead.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        source_dist = source_dist.filter(Lead.assigned_to_id == user_filter)
    source_distribution = {source.value: count for source, count in source_dist.all()}
    
    # Status distribution
    status_dist = db.query(Lead.status, func.count(Lead.id)).group_by(Lead.status)
    if start_date:
        status_dist = status_dist.filter(Lead.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        status_dist = status_dist.filter(Lead.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        status_dist = status_dist.filter(Lead.assigned_to_id == user_filter)
    status_distribution = {status.value: count for status, count in status_dist.all()}
    
    # Monthly leads
    monthly = db.query(
        func.strftime('%Y-%m', Lead.created_at).label('month'),
        func.count(Lead.id).label('count')
    ).group_by('month')
    if start_date:
        monthly = monthly.filter(Lead.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        monthly = monthly.filter(Lead.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        monthly = monthly.filter(Lead.assigned_to_id == user_filter)
    monthly_leads = {month: count for month, count in monthly.all()}
    
    return LeadAnalytics(
        total_leads=total_leads,
        conversion_rate=round(conversion_rate, 2),
        source_distribution=source_distribution,
        status_distribution=status_distribution,
        monthly_leads=monthly_leads
    )


def get_deal_analytics(
    db: Session,
    current_user: User,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> DealAnalytics:
    """
    Get deal analytics with pipeline metrics.
    """
    is_sales = current_user.role == UserRole.SALES
    user_filter = current_user.id if is_sales else None
    
    deal_query = db.query(Deal)
    if start_date:
        deal_query = deal_query.filter(Deal.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        deal_query = deal_query.filter(Deal.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        deal_query = deal_query.filter(Deal.owner_id == user_filter)
    
    total_deals = deal_query.count()
    
    # Value metrics
    total_value = db.query(func.sum(Deal.value))
    if start_date:
        total_value = total_value.filter(Deal.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        total_value = total_value.filter(Deal.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        total_value = total_value.filter(Deal.owner_id == user_filter)
    total_value = total_value.scalar() or Decimal(0)
    
    average_value = (total_value / total_deals) if total_deals > 0 else Decimal(0)
    
    # Win rate
    won_count = deal_query.filter(Deal.stage == DealStage.CLOSED_WON).count()
    closed_count = deal_query.filter(Deal.stage.in_([DealStage.CLOSED_WON, DealStage.CLOSED_LOST])).count()
    win_rate = (won_count / closed_count * 100) if closed_count > 0 else 0.0
    
    # Stage distribution
    stage_dist = db.query(Deal.stage, func.count(Deal.id)).group_by(Deal.stage)
    if start_date:
        stage_dist = stage_dist.filter(Deal.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        stage_dist = stage_dist.filter(Deal.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        stage_dist = stage_dist.filter(Deal.owner_id == user_filter)
    stage_distribution = {stage.value: count for stage, count in stage_dist.all()}
    
    # Stage value distribution
    stage_value = db.query(Deal.stage, func.sum(Deal.value)).group_by(Deal.stage)
    if start_date:
        stage_value = stage_value.filter(Deal.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        stage_value = stage_value.filter(Deal.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        stage_value = stage_value.filter(Deal.owner_id == user_filter)
    stage_value_distribution = {stage.value: (value or Decimal(0)) for stage, value in stage_value.all()}
    
    # Monthly revenue (won deals)
    monthly_rev = db.query(
        func.strftime('%Y-%m', Deal.updated_at).label('month'),
        func.sum(Deal.value).label('revenue')
    ).filter(Deal.stage == DealStage.CLOSED_WON).group_by('month')
    if start_date:
        monthly_rev = monthly_rev.filter(Deal.updated_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        monthly_rev = monthly_rev.filter(Deal.updated_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        monthly_rev = monthly_rev.filter(Deal.owner_id == user_filter)
    monthly_revenue = {month: (revenue or Decimal(0)) for month, revenue in monthly_rev.all()}
    
    return DealAnalytics(
        total_deals=total_deals,
        total_value=total_value,
        average_deal_value=average_value,
        win_rate=round(win_rate, 2),
        stage_distribution=stage_distribution,
        stage_value_distribution=stage_value_distribution,
        monthly_revenue=monthly_revenue
    )


def get_sales_performance(
    db: Session,
    current_user: User
) -> SalesPerformance:
    """
    Get sales performance metrics per user.
    """
    # Only admin/manager can see all users
    if current_user.role in [UserRole.ADMIN, UserRole.MANAGER]:
        users = db.query(User).filter(User.role.in_([UserRole.SALES, UserRole.MANAGER])).all()
    else:
        users = [current_user]
    
    user_performances = []
    
    for user in users:
        leads_assigned = db.query(Lead).filter(Lead.assigned_to_id == user.id).count()
        customers_managed = db.query(Customer).filter(Customer.assigned_to_id == user.id).count()
        deals_owned = db.query(Deal).filter(Deal.owner_id == user.id).count()
        
        total_deal_value = db.query(func.sum(Deal.value)).filter(Deal.owner_id == user.id).scalar() or Decimal(0)
        won_deals = db.query(Deal).filter(Deal.owner_id == user.id, Deal.stage == DealStage.CLOSED_WON).count()
        
        closed_deals = db.query(Deal).filter(
            Deal.owner_id == user.id,
            Deal.stage.in_([DealStage.CLOSED_WON, DealStage.CLOSED_LOST])
        ).count()
        win_rate = (won_deals / closed_deals * 100) if closed_deals > 0 else 0.0
        
        active_tasks = db.query(Task).filter(Task.assigned_to_id == user.id, Task.status == TaskStatus.PENDING).count()
        
        user_performances.append(UserPerformance(
            user_id=user.id,
            user_name=user.full_name,
            user_email=user.email,
            leads_assigned=leads_assigned,
            customers_managed=customers_managed,
            deals_owned=deals_owned,
            total_deal_value=total_deal_value,
            won_deals=won_deals,
            win_rate=round(win_rate, 2),
            active_tasks=active_tasks
        ))
    
    return SalesPerformance(
        users=user_performances,
        total_users=len(user_performances)
    )


def get_task_analytics(
    db: Session,
    current_user: User,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> TaskAnalytics:
    """
    Get task analytics.
    """
    is_sales = current_user.role == UserRole.SALES
    user_filter = current_user.id if is_sales else None
    
    task_query = db.query(Task)
    if start_date:
        task_query = task_query.filter(Task.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        task_query = task_query.filter(Task.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        task_query = task_query.filter(Task.assigned_to_id == user_filter)
    
    total_tasks = task_query.count()
    pending_tasks = task_query.filter(Task.status == TaskStatus.PENDING).count()
    completed_tasks = task_query.filter(Task.status == TaskStatus.COMPLETED).count()
    overdue_tasks = task_query.filter(Task.status == TaskStatus.OVERDUE).count()
    
    # Priority distribution
    priority_dist = db.query(Task.priority, func.count(Task.id)).group_by(Task.priority)
    if start_date:
        priority_dist = priority_dist.filter(Task.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        priority_dist = priority_dist.filter(Task.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        priority_dist = priority_dist.filter(Task.assigned_to_id == user_filter)
    priority_distribution = {priority.value: count for priority, count in priority_dist.all()}
    
    # Tasks by entity type
    entity_dist = db.query(Task.related_type, func.count(Task.id)).filter(Task.related_type.isnot(None)).group_by(Task.related_type)
    if start_date:
        entity_dist = entity_dist.filter(Task.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        entity_dist = entity_dist.filter(Task.created_at <= datetime.combine(end_date, datetime.max.time()))
    if user_filter:
        entity_dist = entity_dist.filter(Task.assigned_to_id == user_filter)
    tasks_by_entity = {entity.value: count for entity, count in entity_dist.all()}
    
    return TaskAnalytics(
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        completed_tasks=completed_tasks,
        overdue_tasks=overdue_tasks,
        priority_distribution=priority_distribution,
        tasks_by_entity=tasks_by_entity
    )
