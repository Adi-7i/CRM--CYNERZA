"""
Task management endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.core.permissions import require_admin_or_manager
from app.models.user import User
from app.models.task import TaskPriority, TaskStatus, RelatedEntityType
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskStatusUpdate,
    TaskAssign,
    TaskListResponse
)
from app.crud import task as task_crud
from app.services import task_service


router = APIRouter()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new task.
    
    **Permissions**: All authenticated users can create tasks.
    
    - **title**: Task title
    - **description**: Task description (optional)
    - **assigned_to_id**: User ID to assign task to
    - **related_type**: Related entity type (lead/customer/deal, optional)
    - **related_id**: Related entity ID (required if related_type is provided)
    - **due_date**: Task due date (optional)
    - **priority**: Task priority (Low/Medium/High, default: Medium)
    - **status**: Task status (Pending/Completed/Overdue, default: Pending)
    """
    task = task_service.create_task_with_validation(db, task_in, current_user)
    return task


@router.get("/", response_model=TaskListResponse)
def list_tasks(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    related_type: Optional[RelatedEntityType] = Query(None, description="Filter by related entity type"),
    related_id: Optional[int] = Query(None, description="Filter by related entity ID"),
    search: Optional[str] = Query(None, description="Search in task title"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List tasks with filters and pagination.
    
    **Permissions**:
    - Admin & Manager: See all tasks
    - Sales: See only assigned tasks
    
    **Filters**:
    - status: Filter by task status
    - priority: Filter by priority
    - related_type: Filter by related entity type
    - related_id: Filter by related entity ID
    - search: Search in task title
    
    **Pagination**:
    - skip: Number of records to skip (default: 0)
    - limit: Max records to return (default: 100, max: 500)
    
    **Note**: Overdue tasks are automatically detected and updated.
    """
    tasks, total = task_service.get_tasks_for_user(
        db=db,
        user=current_user,
        skip=skip,
        limit=limit,
        status=status,
        priority=priority,
        related_type=related_type,
        related_id=related_id,
        search=search
    )
    
    return TaskListResponse(
        total=total,
        skip=skip,
        limit=limit,
        tasks=tasks
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific task by ID.
    
    **Permissions**:
    - Admin & Manager: Can view any task
    - Sales: Can only view assigned tasks
    
    Returns task details including relationships (assigned_to, created_by).
    """
    task = task_crud.get_task(db, task_id=task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not task_service.can_user_access_task(current_user, task):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this task"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing task.
    
    **Permissions**:
    - Admin & Manager: Can update any task
    - Sales: Can only update assigned tasks
    
    All fields are optional - only provided fields will be updated.
    """
    task = task_crud.get_task(db, task_id=task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not task_service.can_user_modify_task(current_user, task):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this task"
        )
    
    # Validate assignee if being updated
    if task_in.assigned_to_id is not None:
        task_service.validate_task_assignee(db, task_in.assigned_to_id)
    
    # Validate related entity if being updated
    if task_in.related_type and task_in.related_id:
        task_service.validate_related_entity(db, task_in.related_type, task_in.related_id)
    
    updated_task = task_crud.update_task(db, task_id=task_id, task_update=task_in)
    return updated_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Delete a task.
    
    **Requires**: Admin or Manager role
    """
    success = task_crud.delete_task(db, task_id=task_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return None


@router.put("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status_update: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update task status.
    
    **Permissions**:
    - Admin & Manager: Can update any task status
    - Sales: Can only update status of assigned tasks
    
    Status values: Pending, Completed, Overdue
    """
    task = task_crud.get_task(db, task_id=task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not task_service.can_user_modify_task(current_user, task):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this task"
        )
    
    updated_task = task_crud.update_task_status(db, task_id=task_id, status=status_update.status)
    
    return updated_task


@router.post("/{task_id}/assign", response_model=TaskResponse)
def assign_task(
    task_id: int,
    assign_data: TaskAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Assign a task to a user.
    
    **Requires**: Admin or Manager role
    """
    task = task_crud.get_task(db, task_id=task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Validate assignee
    task_service.validate_task_assignee(db, assign_data.assigned_to_id)
    
    # Assign task
    updated_task = task_crud.assign_task(db, task_id=task_id, assigned_to_id=assign_data.assigned_to_id)
    
    return updated_task
