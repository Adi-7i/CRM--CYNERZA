"""
CRUD operations for Task model.
"""
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from datetime import date

from app.models.task import Task, TaskPriority, TaskStatus, RelatedEntityType
from app.schemas.task import TaskCreate, TaskUpdate


def create_task(db: Session, task: TaskCreate, created_by_id: int) -> Task:
    """
    Create a new task.
    
    Args:
        db: Database session
        task: Task creation schema
        created_by_id: ID of user creating the task
        
    Returns:
        Created Task object
    """
    db_task = Task(
        title=task.title,
        description=task.description,
        assigned_to_id=task.assigned_to_id,
        created_by_id=created_by_id,
        related_type=task.related_type,
        related_id=task.related_id,
        due_date=task.due_date,
        priority=task.priority,
        status=task.status
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task


def get_task(db: Session, task_id: int) -> Optional[Task]:
    """
    Get a task by ID.
    
    Args:
        db: Database session
        task_id: Task ID
        
    Returns:
        Task object if found, None otherwise
    """
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    assigned_to_id: Optional[int] = None,
    related_type: Optional[RelatedEntityType] = None,
    related_id: Optional[int] = None,
    search: Optional[str] = None
) -> Tuple[List[Task], int]:
    """
    Get a list of tasks with filters and pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        status: Filter by status
        priority: Filter by priority
        assigned_to_id: Filter by assignee
        related_type: Filter by related entity type
        related_id: Filter by related entity ID
        search: Search in task title
        
    Returns:
        Tuple of (list of tasks, total count)
    """
    query = db.query(Task)
    
    # Apply filters
    if status:
        query = query.filter(Task.status == status)
    
    if priority:
        query = query.filter(Task.priority == priority)
    
    if assigned_to_id:
        query = query.filter(Task.assigned_to_id == assigned_to_id)
    
    if related_type:
        query = query.filter(Task.related_type == related_type)
    
    if related_id is not None:
        query = query.filter(Task.related_id == related_id)
    
    if search:
        search_filter = Task.title.ilike(f"%{search}%")
        query = query.filter(search_filter)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination and ordering
    tasks = query.order_by(Task.due_date.asc().nullsfirst(), Task.created_at.desc()).offset(skip).limit(limit).all()
    
    return tasks, total


def update_task(db: Session, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
    """
    Update an existing task.
    
    Args:
        db: Database session
        task_id: Task ID to update
        task_update: Task update schema
        
    Returns:
        Updated Task object if found, None otherwise
    """
    db_task = get_task(db, task_id)
    
    if not db_task:
        return None
    
    # Update fields if provided
    update_data = task_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    
    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    """
    Delete a task.
    
    Args:
        db: Database session
        task_id: Task ID to delete
        
    Returns:
        True if deleted, False if not found
    """
    db_task = get_task(db, task_id)
    
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    
    return True


def update_task_status(db: Session, task_id: int, status: TaskStatus) -> Optional[Task]:
    """
    Update task status.
    
    Args:
        db: Database session
        task_id: Task ID
        status: New status
        
    Returns:
        Updated Task object if found, None otherwise
    """
    db_task = get_task(db, task_id)
    
    if not db_task:
        return None
    
    db_task.status = status
    db.commit()
    db.refresh(db_task)
    
    return db_task


def assign_task(db: Session, task_id: int, assigned_to_id: int) -> Optional[Task]:
    """
    Assign a task to a user.
    
    Args:
        db: Database session
        task_id: Task ID
        assigned_to_id: User ID to assign to
        
    Returns:
        Updated Task object if found, None otherwise
    """
    db_task = get_task(db, task_id)
    
    if not db_task:
        return None
    
    db_task.assigned_to_id = assigned_to_id
    db.commit()
    db.refresh(db_task)
    
    return db_task


def update_overdue_tasks(db: Session) -> int:
    """
    Update status of overdue tasks.
    
    Args:
        db: Database session
        
    Returns:
        Number of tasks updated
    """
    today = date.today()
    
    # Find pending tasks that are past due date
    overdue_tasks = db.query(Task).filter(
        Task.status == TaskStatus.PENDING,
        Task.due_date < today
    ).all()
    
    count = 0
    for task in overdue_tasks:
        task.status = TaskStatus.OVERDUE
        count += 1
    
    if count > 0:
        db.commit()
    
    return count
