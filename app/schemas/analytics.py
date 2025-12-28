"""
Pydantic schemas for Analytics and Dashboard responses.
"""
from typing import Dict, List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field


# ========== Dashboard Overview ==========

class DashboardOverview(BaseModel):
    """
    Main dashboard overview with key metrics.
    """
    total_leads: int = Field(..., description="Total number of leads")
    active_leads: int = Field(..., description="Active leads (not Won/Lost)")
    converted_customers: int = Field(..., description="Total customers from converted leads")
    total_customers: int = Field(..., description="Total number of customers")
    total_deals: int = Field(..., description="Total number of deals")
    won_deals: int = Field(..., description="Deals marked as Won")
    lost_deals: int = Field(..., description="Deals marked as Lost")
    active_deals: int = Field(..., description="Deals in active stages")
    total_revenue: Decimal = Field(..., description="Total revenue from won deals")
    pipeline_value: Decimal = Field(..., description="Total value of active deals")
    weighted_pipeline: Decimal = Field(..., description="Weighted pipeline value")
    active_tasks: int = Field(..., description="Pending tasks")
    overdue_tasks: int = Field(..., description="Overdue tasks")


# ========== Lead Analytics ==========

class LeadAnalytics(BaseModel):
    """
    Lead analytics with distributions and metrics.
    """
    total_leads: int = Field(..., description="Total number of leads")
    conversion_rate: float = Field(..., description="Lead to customer conversion rate (%)")
    source_distribution: Dict[str, int] = Field(..., description="Leads by source")
    status_distribution: Dict[str, int] = Field(..., description="Leads by status")
    monthly_leads: Dict[str, int] = Field(..., description="Leads created per month")


# ========== Deal Analytics ==========

class DealAnalytics(BaseModel):
    """
    Deal analytics with pipeline and revenue metrics.
    """
    total_deals: int = Field(..., description="Total number of deals")
    total_value: Decimal = Field(..., description="Sum of all deal values")
    average_deal_value: Decimal = Field(..., description="Average deal value")
    win_rate: float = Field(..., description="Win rate percentage")
    stage_distribution: Dict[str, int] = Field(..., description="Deals by stage")
    stage_value_distribution: Dict[str, Decimal] = Field(..., description="Total value by stage")
    monthly_revenue: Dict[str, Decimal] = Field(..., description="Revenue by month")


# ========== Sales Performance ==========

class UserPerformance(BaseModel):
    """
    Individual user performance metrics.
    """
    user_id: int
    user_name: str
    user_email: str
    leads_assigned: int = Field(..., description="Leads assigned to user")
    customers_managed: int = Field(..., description="Customers assigned to user")
    deals_owned: int = Field(..., description="Deals owned by user")
    total_deal_value: Decimal = Field(..., description="Total value of owned deals")
    won_deals: int = Field(..., description="Number of won deals")
    win_rate: float = Field(..., description="Win rate percentage")
    active_tasks: int = Field(..., description="Active tasks assigned")


class SalesPerformance(BaseModel):
    """
    Sales team performance overview.
    """
    users: List[UserPerformance] = Field(..., description="Performance per user")
    total_users: int = Field(..., description="Total number of users")


# ========== Task Analytics ==========

class TaskAnalytics(BaseModel):
    """
    Task analytics and distributions.
    """
    total_tasks: int = Field(..., description="Total number of tasks")
    pending_tasks: int = Field(..., description="Tasks with Pending status")
    completed_tasks: int = Field(..., description="Tasks with Completed status")
    overdue_tasks: int = Field(..., description="Tasks with Overdue status")
    priority_distribution: Dict[str, int] = Field(..., description="Tasks by priority")
    tasks_by_entity: Dict[str, int] = Field(..., description="Tasks by related entity type")
