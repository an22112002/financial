
from fastapi import APIRouter
from api.service.department_service import deleteDepartment, getDepartments, createDepartment, getDepartmentsWithContractData
from api.model.department_model import Department, DepartmentContractsData

department_router = APIRouter(prefix="/departments", tags=["departments"])


@department_router.get("/get")
async def get_departments():
    departments = getDepartments()
    return {"success": True, "message": "List of departments", "data": departments}

@department_router.post("/create/{name}")
async def create_department(name: str):
    new_departments: Department = createDepartment(name)
    if new_departments is not None:
        return {"success": True, "message": "Department created successfully", "data": new_departments}
    else:
        return {"success": False, "message": "Failed to create department"}
    
@department_router.delete("/delete/{departmentID}")
async def delete_department(departmentID: str):
    deleted_departments: Department = deleteDepartment(departmentID)
    if deleted_departments is not None:
        return {"success": True, "message": "Department deleted successfully", "data": deleted_departments}
    else:
        return {"success": False, "message": "Failed to delete department"}
    
@department_router.get("/contracts-info/{departmentID}")
async def get_departments_info(departmentID: str):
    departments_info = getDepartmentsWithContractData(departmentID)
    return {"success": True, "message": "List of departments with contract count", "data": departments_info}

