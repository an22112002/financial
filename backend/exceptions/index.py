from exceptions import *

__all__ = [
    'InvalidInputError',
    'ResourceNotFoundError',
    'PermissionDeniedError',
    'AuthenticationError',
    'ServerError',
    'TimeoutError',
    'ConflictError',
    'BadRequestError',
    'UnauthorizedError',
    'ForbiddenError',
    'NotFoundError',
    'InternalServerError',
    'ServiceUnavailableError',
]

class AppException(Exception):
    code = 500
    message = "An error occurred."

    def __init__(self, message=None):
        if message:
            self.message = message
        super().__init__(self.message)

class InvalidInputError(AppException):
    code = 400
    message = "Invalid input provided."

class ResourceNotFoundError(AppException):
    code = 404
    message = "Requested resource not found."

class PermissionDeniedError(AppException):
    code = 403
    message = "Permission denied."

class AuthenticationError(AppException):
    code = 401
    message = "Authentication failed."

class ServerError(AppException):
    code = 500
    message = "Internal server error."

class TimeoutError(AppException):
    code = 504
    message = "Request timed out."

class ConflictError(AppException):
    code = 409
    message = "Conflict occurred."

class BadRequestError(AppException):
    code = 400
    message = "Bad request."

class UnauthorizedError(AppException):
    code = 401
    message = "Unauthorized access."

class ForbiddenError(AppException):
    code = 403
    message = "Forbidden access."

class NotFoundError(AppException):
    code = 404
    message = "Not found."

class InternalServerError(AppException):
    code = 500
    message = "Internal server error."

class ServiceUnavailableError(AppException):
    code = 503
    message = "Service unavailable."
