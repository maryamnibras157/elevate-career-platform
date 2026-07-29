import logging
import sys
from loguru import logger

def setup_admin_logging():
    """
    Sets up structured logging specifically for the admin module, 
    compatible with the main application's logging.
    """
    admin_logger = logger.bind(module="admin")
    return admin_logger

admin_logger = setup_admin_logging()
