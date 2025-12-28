"""
Role-Based Access Control (RBAC) permissions module.
Provides reusable permission dependencies for protecting API endpoints.
"""
from typing import List, Callable
from fastapi import Depends, HTTPException, status

from app.models.user import User, UserRole
from app.api.deps import get_current_active_user


def require_role(*allowed_roles: UserRole) -> Callable:
    """
    Factory function to create a dependency that enforces role-based access control.
    
    This is the core RBAC function that all other permission functions use.
    
    Args:
        *allowed_roles: Variable number of UserRole enums that are permitted
        
    Returns:
        Callable: Dependency function that validates user role
        
    Example:
        @router.get("/special")
        def special_route(user: User = Depends(require_role(UserRole.ADMIN, UserRole.MANAGER))):
            return {"message": "Only admins and managers can see this"}
    """
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        """
        Validates that the current user has one of the allowed roles.
        
        Args:
            current_user: Current authenticated user from JWT token
            
        Returns:
            User: The current user if they have permission
            
        Raises:
            HTTPException: 403 Forbidden if user doesn't have required role
        """
        if current_user.role not in allowed_roles:
            role_names = ", ".join([role.value for role in allowed_roles])
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {role_names}. Your role: {current_user.role.value}"
            )
        return current_user
    
    return role_checker


def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency that requires ADMIN role.
    
    Use this for endpoints that should only be accessible by administrators.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: The current user if they are an admin
        
    Raises:
        HTTPException: 403 Forbidden if user is not an admin
        
    Example:
        @router.delete("/users/{user_id}")
        def delete_user(user_id: int, admin: User = Depends(require_admin)):
            # Only admins can delete users
            return {"message": "User deleted"}
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Admin access required. Your role: {current_user.role.value}"
        )
    return current_user


def require_manager(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency that requires MANAGER role.
    
    Use this for endpoints that should only be accessible by managers.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: The current user if they are a manager
        
    Raises:
        HTTPException: 403 Forbidden if user is not a manager
        
    Example:
        @router.get("/team-reports")
        def team_reports(manager: User = Depends(require_manager)):
            # Only managers can view team reports
            return {"message": "Team reports"}
    """
    if current_user.role != UserRole.MANAGER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Manager access required. Your role: {current_user.role.value}"
        )
    return current_user


def require_sales(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency that requires SALES role.
    
    Use this for endpoints that should only be accessible by sales team members.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: The current user if they are in sales
        
    Raises:
        HTTPException: 403 Forbidden if user is not in sales
        
    Example:
        @router.post("/leads")
        def create_lead(lead_data: dict, sales: User = Depends(require_sales)):
            # Only sales team can create leads
            return {"message": "Lead created"}
    """
    if current_user.role != UserRole.SALES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Sales role required. Your role: {current_user.role.value}"
        )
    return current_user


def require_admin_or_manager(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency that requires either ADMIN or MANAGER role.
    
    Use this for management-level endpoints that both admins and managers should access.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: The current user if they are admin or manager
        
    Raises:
        HTTPException: 403 Forbidden if user is neither admin nor manager
        
    Example:
        @router.get("/reports")
        def view_reports(user: User = Depends(require_admin_or_manager)):
            # Admins and managers can view reports
            return {"message": "Reports data"}
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Admin or Manager access required. Your role: {current_user.role.value}"
        )
    return current_user


def require_manager_or_sales(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency that requires either MANAGER or SALES role.
    
    Use this for endpoints that sales teams and their managers should access.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: The current user if they are manager or sales
        
    Raises:
        HTTPException: 403 Forbidden if user is neither manager nor sales
        
    Example:
        @router.get("/customers")
        def view_customers(user: User = Depends(require_manager_or_sales)):
            # Managers and sales can view customers
            return {"message": "Customer data"}
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.SALES]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Manager or Sales access required. Your role: {current_user.role.value}"
        )
    return current_user


# Role hierarchy helpers
def has_any_role(user: User, roles: List[UserRole]) -> bool:
    """
    Check if user has any of the specified roles.
    
    Args:
        user: User to check
        roles: List of roles to check against
        
    Returns:
        bool: True if user has any of the roles
    """
    return user.role in roles


def is_admin(user: User) -> bool:
    """Check if user is an admin."""
    return user.role == UserRole.ADMIN


def is_manager(user: User) -> bool:
    """Check if user is a manager."""
    return user.role == UserRole.MANAGER


def is_sales(user: User) -> bool:
    """Check if user is in sales."""
    return user.role == UserRole.SALES


def can_manage_users(user: User) -> bool:
    """
    Check if user has permission to manage other users.
    Currently only admins can manage users.
    """
    return user.role == UserRole.ADMIN


def can_manage_team(user: User) -> bool:
    """
    Check if user can manage a team.
    Admins and managers can manage teams.
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER]


def can_access_sales_data(user: User) -> bool:
    """
    Check if user can access sales data.
    All roles can access sales data (with different scopes).
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES]


# Lead-specific permissions
def can_access_lead(user: User, lead) -> bool:
    """
    Check if user can access a specific lead.
    
    Args:
        user: Current user
        lead: Lead object to check
        
    Returns:
        bool: True if user can access the lead
    """
    # Admin and Manager can access all leads
    if user.role in [UserRole.ADMIN, UserRole.MANAGER]:
        return True
    
    # Sales can only access assigned leads
    if user.role == UserRole.SALES:
        return lead.assigned_to_id == user.id
    
    return False


def can_manage_all_leads(user: User) -> bool:
    """
    Check if user can manage all leads (not just assigned ones).
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER]
