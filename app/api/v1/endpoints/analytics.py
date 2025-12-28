"""
Analytics and dashboard endpoints.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.analytics import (
    DashboardOverview,
    LeadAnalytics,
    DealAnalytics,
    SalesPerformance,
    TaskAnalytics
)
from app.services import analytics_service


router = APIRouter()


@router.get("/dashboard", response_model=DashboardOverview)
def get_dashboard(
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get dashboard overview with key metrics.
    
    **Permissions**:
    - Admin & Manager: See all metrics across the organization
    - Sales: See only own metrics
    
    **Metrics included**:
    - Lead statistics (total, active, conversion)
    - Customer statistics
    - Deal statistics (total, won, lost, revenue)
    - Pipeline value and weighted pipeline
    - Task statistics (active, overdue)
    
    **Query parameters**:
    - start_date: Filter data from this date (optional)
    - end_date: Filter data until this date (optional)
    
    Returns aggregated KPIs perfect for dashboard cards.
    """
    return analytics_service.get_dashboard_overview(db, current_user, start_date, end_date)


@router.get("/leads", response_model=LeadAnalytics)
def get_lead_analytics(
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get lead analytics with distributions.
    
    **Permissions**:
    - Admin & Manager: See all lead analytics
    - Sales: See only assigned lead analytics
    
    **Analytics included**:
    - Total leads and conversion rate
    - Lead source distribution (for pie charts)
    - Lead status distribution (for pie charts)
    - Monthly lead creation (for line/bar charts)
    
    Perfect for lead performance charts and source analysis.
    """
    return analytics_service.get_lead_analytics(db, current_user, start_date, end_date)


@router.get("/deals", response_model=DealAnalytics)
def get_deal_analytics(
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get deal analytics with pipeline metrics.
    
    **Permissions**:
    - Admin & Manager: See all deal analytics
    - Sales: See only own deal analytics
    
    **Analytics included**:
    - Total deals, total value, average deal value
    - Win rate percentage
    - Deal stage distribution (for pipeline charts)
    - Stage value distribution
    - Monthly revenue (for revenue charts)
    
    Perfect for sales pipeline visualization and revenue tracking.
    """
    return analytics_service.get_deal_analytics(db, current_user, start_date, end_date)


@router.get("/sales-performance", response_model=SalesPerformance)
def get_sales_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get sales performance metrics per user.
    
    **Permissions**:
    - Admin & Manager: See performance of all sales users
    - Sales: See only own performance
    
    **Metrics per user**:
    - Leads assigned
    - Customers managed
    - Deals owned and total value
    - Won deals and win rate
    - Active tasks
    
    Perfect for leaderboards and team performance comparison.
    """
    return analytics_service.get_sales_performance(db, current_user)


@router.get("/tasks", response_model=TaskAnalytics)
def get_task_analytics(
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get task analytics and distributions.
    
    **Permissions**:
    - Admin & Manager: See all task analytics
    - Sales: See only assigned task analytics
    
    **Analytics included**:
    - Total, pending, completed, overdue tasks
    - Priority distribution (for pie charts)
    - Tasks by entity type (for bar charts)
    
    Perfect for task management dashboards and productivity tracking.
    """
    return analytics_service.get_task_analytics(db, current_user, start_date, end_date)
