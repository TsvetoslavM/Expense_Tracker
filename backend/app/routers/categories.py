from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_current_admin_user
from app.models.category import Category
from app.models.user import User
from app.schemas.category import Category as CategorySchema, CategoryCreate, CategoryUpdate

router = APIRouter()


@router.get("/", response_model=List[CategorySchema])
def get_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get all categories for the current user.
    """
    categories = (
        db.query(Category)
        .filter(Category.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return categories


@router.post("/defaults", response_model=List[CategorySchema])
def create_default_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create default categories for a user.
    """
    try:
        # Check for existing categories
        existing_categories = db.query(Category).filter(Category.user_id == current_user.id).all()
        print(f"User {current_user.id} has {len(existing_categories)} existing categories")
        
        # Get all existing category names for this user (to avoid duplicates)
        existing_category_names = {category.name.lower() for category in existing_categories}
        print(f"Existing category names: {existing_category_names}")
        
        # Define default categories
        default_categories = [
            {"name": "Groceries", "color": "#4CAF50", "description": "Food and household items"},
            {"name": "Dining", "color": "#FF9800", "description": "Restaurants and takeout"},
            {"name": "Transportation", "color": "#2196F3", "description": "Public transit, fuel, and ride services"},
            {"name": "Housing", "color": "#9C27B0", "description": "Rent, mortgage, and utilities"},
            {"name": "Entertainment", "color": "#E91E63", "description": "Movies, games, and hobbies"},
            {"name": "Health", "color": "#00BCD4", "description": "Medical expenses and fitness"},
            {"name": "Shopping", "color": "#795548", "description": "Clothing and retail purchases"},
            {"name": "Travel", "color": "#607D8B", "description": "Vacations and trips"},
            {"name": "Education", "color": "#FF5722", "description": "Courses, books, and supplies"},
            {"name": "Other", "color": "#9E9E9E", "description": "Miscellaneous expenses"},
        ]
        
        # Create only categories that don't exist
        new_categories = []
        for cat_data in default_categories:
            if cat_data["name"].lower() not in existing_category_names:
                print(f"Creating new default category: {cat_data['name']}")
                category = Category(
                    **cat_data,
                    user_id=current_user.id,
                )
                db.add(category)
                new_categories.append(category)
            else:
                print(f"Default category already exists: {cat_data['name']}")
        
        if new_categories:
            print(f"Committing {len(new_categories)} new categories to database")
            try:
                db.commit()
                # Refresh to get IDs
                for category in new_categories:
                    db.refresh(category)
            except Exception as e:
                db.rollback()
                print(f"Error committing default categories: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create default categories: {str(e)}",
                )
        else:
            print("No new default categories needed")
        
        # Return all categories (both existing and newly created)
        all_categories = db.query(Category).filter(Category.user_id == current_user.id).all()
        print(f"Returning total of {len(all_categories)} categories")
        
        # Debug information about returned categories
        for i, cat in enumerate(all_categories):
            print(f"Category {i+1}: id={cat.id}, name={cat.name}, user_id={cat.user_id}")
            
        return all_categories
        
    except Exception as e:
        print(f"Unexpected error in create_default_categories: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}",
        )


@router.post("/", response_model=CategorySchema)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a new category.
    """
    category = Category(
        **category_in.dict(),
        user_id=current_user.id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/{category_id}", response_model=CategorySchema)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get a specific category by ID.
    """
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    return category


@router.put("/{category_id}", response_model=CategorySchema)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update a category.
    """
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    # Update category attributes
    for key, value in category_in.dict(exclude_unset=True).items():
        setattr(category, key, value)
    
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", response_model=CategorySchema)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a category.
    """
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    # Check if the category is being used by any expenses
    if category.expenses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category that is being used by expenses",
        )
    
    db.delete(category)
    db.commit()
    return category 