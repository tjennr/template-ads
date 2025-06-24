import os
import io
import base64
import uuid
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from flask import render_template, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
from app import app
from shutterstock_api import ShutterstockAPI
from openai import OpenAI
from google import genai
from google.genai import types

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Main page with the template ads designer"""
    return render_template('index.html')

@app.route('/zoom-solutions')
def zoom_solutions():
    """Demo page showing different zoom solution options"""
    return render_template('zoom-solutions.html')

@app.route('/upload-image', methods=['POST'])
def upload_image():
    """Handle image upload for user photos and logos"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file selected'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'})
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            
            # Save and process image
            file.save(filepath)
            
            # Convert to base64 for frontend use
            with open(filepath, 'rb') as img_file:
                img_data = base64.b64encode(img_file.read()).decode('utf-8')
                img_format = filepath.split('.')[-1].upper()
                if img_format == 'JPG':
                    img_format = 'JPEG'
                
                return jsonify({
                    'success': True,
                    'filename': filename,
                    'data_url': f'data:image/{img_format.lower()};base64,{img_data}'
                })
        else:
            return jsonify({'success': False, 'error': 'Invalid file type. Please upload PNG, JPG, JPEG, GIF, BMP, or WEBP files.'})
    
    except Exception as e:
        current_app.logger.error(f'Upload error: {str(e)}')
        return jsonify({'success': False, 'error': 'Upload failed. Please try again.'})

@app.route('/export-image', methods=['POST'])
def export_image():
    """Export the canvas as PNG or JPG"""
    try:
        data = request.get_json()
        image_data = data.get('imageData')
        format_type = data.get('format', 'png').lower()
        
        if not image_data:
            return jsonify({'success': False, 'error': 'No image data provided'})
        
        # Remove data URL prefix
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if exporting as JPG
        if format_type == 'jpg' or format_type == 'jpeg':
            if image.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            format_type = 'JPEG'
        else:
            format_type = 'PNG'
        
        # Save to BytesIO
        img_io = io.BytesIO()
        image.save(img_io, format=format_type, quality=95 if format_type == 'JPEG' else None)
        img_io.seek(0)
        
        filename = f'template_ad_{uuid.uuid4().hex[:8]}.{format_type.lower()}'
        
        return send_file(
            img_io,
            mimetype=f'image/{format_type.lower()}',
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        current_app.logger.error(f'Export error: {str(e)}')
        return jsonify({'success': False, 'error': 'Export failed. Please try again.'})

@app.route('/export-pdf', methods=['POST'])
def export_pdf():
    """Export the canvas as PDF"""
    try:
        data = request.get_json()
        image_data = data.get('imageData')
        
        if not image_data:
            return jsonify({'success': False, 'error': 'No image data provided'})
        
        # Remove data URL prefix
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Create PDF
        pdf_io = io.BytesIO()
        pdf_canvas = canvas.Canvas(pdf_io, pagesize=letter)
        
        # Calculate dimensions to fit on page
        page_width, page_height = letter
        img_width, img_height = image.size
        
        # Scale image to fit page while maintaining aspect ratio
        scale = min((page_width - 72) / img_width, (page_height - 72) / img_height)  # 72 points = 1 inch margin
        new_width = img_width * scale
        new_height = img_height * scale
        
        # Center image on page
        x = (page_width - new_width) / 2
        y = (page_height - new_height) / 2
        
        # Convert PIL image to ReportLab ImageReader
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        img_reader = ImageReader(img_buffer)
        
        # Draw image on PDF
        pdf_canvas.drawImage(img_reader, x, y, new_width, new_height)
        pdf_canvas.save()
        
        pdf_io.seek(0)
        filename = f'template_ad_{uuid.uuid4().hex[:8]}.pdf'
        
        return send_file(
            pdf_io,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        current_app.logger.error(f'PDF export error: {str(e)}')
        return jsonify({'success': False, 'error': 'PDF export failed. Please try again.'})

@app.route('/api/shutterstock/search')
def shutterstock_search():
    """Search Shutterstock for stock images"""
    try:
        query = request.args.get('query', '')
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 50)
        orientation = request.args.get('orientation')
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Initialize Shutterstock API
        shutterstock = ShutterstockAPI()
        
        # Search for images
        results = shutterstock.search_images(
            query=query,
            page=page,
            per_page=per_page,
            orientation=orientation
        )
        
        # Format results for frontend
        formatted_results = {
            'total_count': results.get('total_count', 0),
            'page': results.get('page', 1),
            'per_page': results.get('per_page', 20),
            'images': []
        }
        
        for image in results.get('data', []):
            formatted_results['images'].append({
                'id': image['id'],
                'description': image.get('description', ''),
                'preview_url': image['assets']['preview']['url'],
                'thumbnail_url': image['assets']['preview_1000']['url'],
                'width': image['assets']['preview']['width'],
                'height': image['assets']['preview']['height'],
                'aspect_ratio': image['aspect']
            })
        
        return jsonify(formatted_results)
        
    except ValueError as e:
        return jsonify({'error': 'Shutterstock API credentials not configured'}), 503
    except Exception as e:
        current_app.logger.error(f"Shutterstock search error: {str(e)}")
        return jsonify({'error': 'Failed to search stock images'}), 500

@app.route('/api/shutterstock/download')
def shutterstock_download():
    """Download a Shutterstock image for use in the editor"""
    try:
        image_url = request.args.get('url')
        if not image_url:
            return jsonify({'error': 'Image URL is required'}), 400
        
        # Initialize Shutterstock API
        shutterstock = ShutterstockAPI()
        
        # Download the image
        image_data = shutterstock.download_image_preview(image_url)
        
        # Convert to base64 for frontend
        image_b64 = base64.b64encode(image_data).decode('utf-8')
        
        return jsonify({
            'success': True,
            'image_data': f"data:image/jpeg;base64,{image_b64}"
        })
        
    except Exception as e:
        current_app.logger.error(f"Shutterstock download error: {str(e)}")
        return jsonify({'error': 'Failed to download image'}), 500

@app.route('/api/openai/test-key', methods=['GET'])
def test_openai_key():
    """Test if OpenAI API key is valid"""
    try:
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return jsonify({'error': 'OpenAI API key not configured'}), 503
        
        client = OpenAI(api_key=api_key)
        
        # Test with a simple chat completion
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=5
        )
        
        return jsonify({'success': True, 'message': 'API key is valid'})
        
    except Exception as e:
        return jsonify({'error': f'API key test failed: {str(e)}'}), 500

@app.route('/api/gemini/generate-image', methods=['POST'])
def generate_ai_image():
    """Generate an AI image using Google Gemini"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '').strip()
        orientation = data.get('orientation', 'square')
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Check if Gemini API key is available
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return jsonify({'error': 'Gemini API key not configured. Please check your API key.'}), 503
        
        # Initialize Gemini client
        client = genai.Client(api_key=api_key)
        
        # Create a unique filename for the generated image
        import uuid
        image_filename = f"generated_image_{uuid.uuid4().hex[:8]}.png"
        image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_filename)
        
        # Generate image using Gemini
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE']))
        
        if not response.candidates:
            return jsonify({'error': 'No image generated by Gemini'}), 500
        
        content = response.candidates[0].content
        if not content or not content.parts:
            return jsonify({'error': 'Invalid response from Gemini API'}), 500
        
        # Find the image data in the response
        image_data = None
        for part in content.parts:
            if part.inline_data and part.inline_data.data:
                image_data = part.inline_data.data
                break
        
        if not image_data:
            return jsonify({'error': 'No image data found in Gemini response'}), 500
        
        # Save the image data to a file
        with open(image_path, 'wb') as f:
            f.write(image_data)
        
        # Convert to base64 for frontend use
        with open(image_path, 'rb') as f:
            img_data = f.read()
            img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        # Clean up the temporary file
        os.remove(image_path)
        
        return jsonify({
            'success': True,
            'image_url': f'data:image/png;base64,{img_base64}'
        })
        
    except Exception as e:
        error_msg = str(e)
        current_app.logger.error(f"Gemini image generation error: {error_msg}")
        
        # Provide more specific error messages
        if "quota" in error_msg.lower() or "limit" in error_msg.lower():
            return jsonify({'error': 'Gemini API quota exceeded. Please check your usage limits.'}), 402
        elif "key" in error_msg.lower() or "auth" in error_msg.lower():
            return jsonify({'error': 'Invalid Gemini API key. Please verify your key is correct.'}), 401
        elif "model" in error_msg.lower():
            return jsonify({'error': 'Gemini image generation model not available. Please try again later.'}), 503
        else:
            return jsonify({'error': f'Image generation failed: {error_msg}'}), 500

@app.route('/api/gemini/generate-text', methods=['POST'])
def generate_text():
    """Generate text content using Google Gemini"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '').strip()
        text_type = data.get('type', 'title')  # 'title' or 'subtitle'
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Check if Gemini API key is available
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return jsonify({'error': 'Gemini API key not configured'}), 503
        
        # Initialize Gemini client
        client = genai.Client(api_key=api_key)
        
        # Create appropriate prompt based on text type
        if text_type == 'title':
            system_prompt = f"Generate a compelling, concise ad title (maximum 200 characters, preferably under 8 words) for: {prompt}. Return only the title text, no quotes or explanations."
        else:  # subtitle
            system_prompt = f"Generate an engaging subtitle or description (maximum 200 characters, preferably under 25 words) for: {prompt}. Return only the subtitle text, no quotes or explanations."
        
        # Generate text with Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=system_prompt
        )
        
        if not response or not response.text:
            return jsonify({'error': 'No text generated'}), 500
        
        # Clean up the response text
        generated_text = response.text.strip()
        # Remove quotes if present
        if generated_text.startswith('"') and generated_text.endswith('"'):
            generated_text = generated_text[1:-1]
        if generated_text.startswith("'") and generated_text.endswith("'"):
            generated_text = generated_text[1:-1]
        
        # Ensure text doesn't exceed 200 characters
        if len(generated_text) > 200:
            generated_text = generated_text[:200].strip()
        
        return jsonify({
            'success': True,
            'text': generated_text
        })
        
    except Exception as e:
        current_app.logger.error(f"Gemini text generation error: {str(e)}")
        return jsonify({'error': f'Text generation failed: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'success': False, 'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'success': False, 'error': 'Internal server error. Please try again.'}), 500
