import os
import requests
import base64
from urllib.parse import urlencode

class ShutterstockAPI:
    def __init__(self):
        self.api_token = os.environ.get('SHUTTERSTOCK_API_TOKEN')
        self.base_url = 'https://api.shutterstock.com/v2'
        
        if not self.api_token:
            raise ValueError("Shutterstock API token not found in environment variables")
    
    def get_auth_header(self):
        """Create Bearer token header for Shutterstock API"""
        return {"Authorization": f"Bearer {self.api_token}"}
    
    def search_images(self, query, page=1, per_page=20, category=None, orientation=None):
        """
        Search for images on Shutterstock
        
        Args:
            query: Search term
            page: Page number (default 1)
            per_page: Results per page (max 500, default 20)
            category: Optional category filter
            orientation: 'horizontal', 'vertical', or 'square'
        """
        endpoint = f"{self.base_url}/images/search"
        
        params = {
            'query': query,
            'page': page,
            'per_page': min(per_page, 50),  # Limit to reasonable number
            'sort': 'popular',
            'safe': 'true'
        }
        
        if category:
            params['category'] = category
            
        if orientation:
            params['orientation'] = orientation
        
        headers = self.get_auth_header()
        headers['Content-Type'] = 'application/json'
        
        try:
            response = requests.get(endpoint, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Shutterstock API error: {str(e)}")
    
    def get_image_details(self, image_id):
        """Get detailed information about a specific image"""
        endpoint = f"{self.base_url}/images/{image_id}"
        headers = self.get_auth_header()
        
        try:
            response = requests.get(endpoint, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Shutterstock API error: {str(e)}")
    
    def download_image_preview(self, image_url):
        """Download image preview for use in the editor"""
        try:
            response = requests.get(image_url)
            response.raise_for_status()
            return response.content
        except requests.exceptions.RequestException as e:
            raise Exception(f"Image download error: {str(e)}")