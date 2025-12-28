"""
Example protected endpoints demonstrating authentication and authorization.
"""
from fastapi import APIRouter, Depends
from app.api.deps import get_current_active_user
from app.core.permissions import (
    require_admin,
    require_manager,
    require_sales,
    require_admin_or_manager,
    require_manager_or_sales,
    require_role
)
from app.models.user import User, UserRole


router = APIRouter()


@router.get("/public")
def public_endpoint():
    """
    Public endpoint - No authentication required.
    
    Anyone can access this endpoint.
    """
    return {
        "message": "This is a public endpoint",
        "access": "Everyone"
    }


@router.get("/authenticated")
def authenticated_endpoint(
    current_user: User = Depends(get_current_active_user)
):
    """
    Authenticated endpoint - Requires valid access token.
    
    Any logged-in user can access this endpoint.
    """
    return {
        "message": "This is a protected endpoint",
        "access": "Authenticated users only",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role.value
        }
    }


@router.get("/admin-only")
def admin_only_endpoint(
    current_user: User = Depends(require_admin)
):
    """
    Admin-only endpoint - Requires admin role.
    
    Only users with admin role can access this endpoint.
    """
    return {
        "message": "This is an admin-only endpoint",
        "access": "Admin only",
        "user": current_user.email
    }


@router.get("/management")
def management_endpoint(
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Management endpoint - Requires manager or admin role.
    
    Users with manager or admin role can access this endpoint.
    """
    return {
        "message": "This is a management endpoint",
        "access": "Managers and Admins",
        "user": {
            "email": current_user.email,
            "role": current_user.role.value
        }
    }


@router.get("/manager-only")
def manager_only_endpoint(
    current_user: User = Depends(require_manager)
):
    """
    Manager-only endpoint - Requires manager role specifically.
    
    Only users with manager role can access this endpoint (not admins).
    """
    return {
        "message": "This is a manager-only endpoint",
        "access": "Managers only",
        "user": current_user.email
    }


@router.get("/sales-only")
def sales_only_endpoint(
    current_user: User = Depends(require_role(UserRole.SALES))
):
    """
    Sales-only endpoint - Requires sales role.
    
    Only users with sales role can access this endpoint.
    """
    return {
        "message": "This is a sales-only endpoint",
        "access": "Sales team only",
        "user": current_user.email
    }


@router.get("/my-dashboard")
def user_dashboard(
    current_user: User = Depends(get_current_active_user)
):
    """
    User dashboard - Shows personalized data.
    
    Returns different data based on user role.
    """
    dashboard_data = {
        "message": f"Welcome {current_user.full_name}!",
        "role": current_user.role.value,
        "user_id": current_user.id
    }
    
    # Add role-specific dashboard data
    if current_user.role == UserRole.ADMIN:
        dashboard_data["sections"] = ["Users", "Reports", "Settings", "System"]
    elif current_user.role == UserRole.MANAGER:
        dashboard_data["sections"] = ["Team", "Reports", "Customers"]
    elif current_user.role == UserRole.SALES:
        dashboard_data["sections"] = ["Leads", "Deals", "Activities"]
    
    return dashboard_data


@router.get("/sales-and-managers")
def sales_and_managers_endpoint(
    current_user: User = Depends(require_manager_or_sales)
):
    """
    Endpoint for sales team and managers.
    
    Accessible by both sales team members and managers.
    """
    return {
        "message": "Sales and managers endpoint",
        "access": "Sales team and Managers",
        "user": {
            "email": current_user.email,
            "role": current_user.role.value
        },
        "features": ["View customers", "Create deals", "Update leads"]
    }


@router.get("/custom-permission")
def custom_permission_endpoint(
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.MANAGER))
):
    """
    Example of custom role combination using require_role factory.
    
    This demonstrates how to create custom permission combinations.
    """
    return {
        "message": "Custom permission example",
        "access": "Admin or Manager (using require_role factory)",
        "user": current_user.email,
        "info": "You can combine any roles using require_role(...)"
    }
