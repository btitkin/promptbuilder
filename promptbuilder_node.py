import json
import requests
from typing import Dict, Any, List, Tuple

class PromptBuilderNode:
    """
    ComfyUI Node for Prompt Builder integration with local LLM support
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "description": ("STRING", {
                    "multiline": True,
                    "default": "A beautiful sunset over mountains",
                    "placeholder": "Describe what you want to create..."
                }),
                "api_url": ("STRING", {
                    "default": "http://127.0.0.1:1234",
                    "placeholder": "Local LLM API URL"
                }),
                "model_name": ("STRING", {
                    "default": "dolphin-2.7-mixtral-8x7b",
                    "placeholder": "Model name"
                }),
                "style_filter": (["photorealistic", "anime", "artistic"], {
                    "default": "photorealistic"
                }),
                "num_variations": ("INT", {
                    "default": 3,
                    "min": 1,
                    "max": 10,
                    "step": 1
                }),
            },
            "optional": {
                "api_key": ("STRING", {
                    "default": "",
                    "placeholder": "API Key (if required)"
                }),
                "temperature": ("FLOAT", {
                    "default": 0.7,
                    "min": 0.1,
                    "max": 2.0,
                    "step": 0.1
                }),
                "max_tokens": ("INT", {
                    "default": 2000,
                    "min": 100,
                    "max": 4000,
                    "step": 100
                }),
            }
        }
    
    RETURN_TYPES = ("STRING", "STRING", "STRING")
    RETURN_NAMES = ("positive_prompt", "negative_prompt", "enhanced_description")
    FUNCTION = "generate_prompts"
    CATEGORY = "PromptBuilder"
    DESCRIPTION = "Generate enhanced prompts using local LLM integration"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'ComfyUI-PromptBuilder/1.0'
        })
    
    def make_api_call(self, config: Dict[str, Any], messages: List[Dict[str, str]]) -> str:
        """
        Make API call to local LLM
        """
        headers = {'Content-Type': 'application/json'}
        
        if config.get('api_key'):
            headers['Authorization'] = f"Bearer {config['api_key']}"
        
        payload = {
            "model": config['model_name'],
            "messages": messages,
            "temperature": config.get('temperature', 0.7),
            "max_tokens": config.get('max_tokens', 2000),
        }
        
        try:
            response = self.session.post(
                f"{config['api_url']}/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content']
            else:
                raise Exception(f"API Error: {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Connection Error: {str(e)}")
    
    def create_system_prompt(self, style_filter: str, num_variations: int) -> str:
        """
        Create system prompt for LLM
        """
        style_guidance = {
            "photorealistic": "Focus on realistic, detailed descriptions suitable for photorealistic image generation. Include lighting, composition, and technical photography terms.",
            "anime": "Focus on anime and manga style descriptions. Include character design elements, art style references, and anime-specific terminology.",
            "artistic": "Focus on artistic and creative descriptions. Include art movements, techniques, and aesthetic elements."
        }
        
        return f"""You are an AI assistant specialized in generating detailed image prompts for AI art generation.

Task: Generate {num_variations} enhanced prompt variations based on the user's input.

Style Focus: {style_guidance.get(style_filter, style_guidance['photorealistic'])}

Return your response as a JSON object with this exact structure:
{{
    "prompts": [
        {{
            "positive": "detailed positive prompt here",
            "negative": "negative prompt elements to avoid"
        }}
    ],
    "enhanced_description": "enhanced and detailed description of the scene"
}}

Ensure each prompt is detailed, specific, and optimized for high-quality image generation."""
    
    def generate_prompts(self, description: str, api_url: str, model_name: str, 
                        style_filter: str, num_variations: int, api_key: str = "", 
                        temperature: float = 0.7, max_tokens: int = 2000) -> Tuple[str, str, str]:
        """
        Generate enhanced prompts using local LLM
        """
        try:
            config = {
                'api_url': api_url.rstrip('/'),
                'model_name': model_name,
                'api_key': api_key,
                'temperature': temperature,
                'max_tokens': max_tokens
            }
            
            system_prompt = self.create_system_prompt(style_filter, num_variations)
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Create enhanced prompts for: {description}"}
            ]
            
            response = self.make_api_call(config, messages)
            
            # Parse JSON response
            try:
                result = json.loads(response)
                
                # Extract first prompt variation
                if result.get('prompts') and len(result['prompts']) > 0:
                    first_prompt = result['prompts'][0]
                    positive_prompt = first_prompt.get('positive', description)
                    negative_prompt = first_prompt.get('negative', 'blurry, low quality, distorted')
                else:
                    positive_prompt = description
                    negative_prompt = 'blurry, low quality, distorted'
                
                enhanced_description = result.get('enhanced_description', description)
                
                return (positive_prompt, negative_prompt, enhanced_description)
                
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return (response, 'blurry, low quality, distorted', response)
                
        except Exception as e:
            error_msg = f"Error generating prompts: {str(e)}"
            print(f"PromptBuilder Node Error: {error_msg}")
            return (description, 'blurry, low quality, distorted', error_msg)

# Node registration
NODE_CLASS_MAPPINGS = {
    "PromptBuilderNode": PromptBuilderNode
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptBuilderNode": "Prompt Builder (Local LLM)"
}