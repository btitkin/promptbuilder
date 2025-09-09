import json
import requests
from typing import Dict, Any, List, Tuple, Optional
import random

class PromptBuilderLocalNode:
    """
    Advanced ComfyUI Node for Prompt Builder with Local LLM - Full Feature Set
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
                "target_model": (["SDXL", "Pony", "SD 1.5", "Flux", "Google Imagen4", "OpenAI", "MidJourney", "Illustrious", "NoobAI"], {
                    "default": "SDXL"
                }),
                "style_main": (["realistic", "anime"], {
                    "default": "realistic"
                }),
                "style_sub": (["professional", "amateur", "flash", "ghibli", "naruto", "bleach"], {
                    "default": "professional"
                }),
                "num_variations": ("INT", {
                    "default": 3,
                    "min": 1,
                    "max": 10,
                    "step": 1
                }),
            },
            "optional": {
                # API Configuration
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
                
                # NSFW Settings
                "nsfw_mode": (["off", "nsfw", "hardcore"], {
                    "default": "off"
                }),
                "nsfw_level": ("INT", {
                    "default": 5,
                    "min": 1,
                    "max": 10,
                    "step": 1
                }),
                "hardcore_level": ("INT", {
                    "default": 5,
                    "min": 1,
                    "max": 10,
                    "step": 1
                }),
                "enhance_person": ("BOOLEAN", {
                    "default": True
                }),
                "enhance_pose": ("BOOLEAN", {
                    "default": True
                }),
                "enhance_location": ("BOOLEAN", {
                    "default": True
                }),
                "ai_imagination": ("BOOLEAN", {
                    "default": True
                }),
                
                # Character Settings
                "gender": (["any", "male", "female", "mixed", "random"], {
                    "default": "any"
                }),
                "random_seed": ("INT", {
                    "default": -1,
                    "min": -1,
                    "max": 999999,
                    "step": 1
                }),
                "enable_random_generation": ("BOOLEAN", {
                    "default": False
                }),
                "random_intensity": ("FLOAT", {
                    "default": 0.5,
                    "min": 0.1,
                    "max": 1.0,
                    "step": 0.1
                }),
                "age_range": (["any", "18s", "25s", "30s", "40s", "50s", "60s", "70+"], {
                    "default": "any"
                }),
                "body_type": (["any", "slim", "curvy", "athletic", "instagram model", "fat", "muscular", "big muscular"], {
                    "default": "any"
                }),
                "ethnicity": (["any", "caucasian", "european", "scandinavian", "slavic", "mediterranean", "asian", "japanese", "chinese", "korean", "indian", "african", "hispanic", "middle eastern", "native american"], {
                    "default": "any"
                }),
                "height_range": (["any", "very short (<150cm)", "short (150-165cm)", "average (165-180cm)", "tall (>180cm)"], {
                    "default": "any"
                }),
                
                # Female Specific
                "breast_size": (["any", "flat", "small", "medium", "large", "huge", "gigantic"], {
                    "default": "any"
                }),
                "hips_size": (["any", "narrow", "average", "wide", "extra wide"], {
                    "default": "any"
                }),
                "butt_size": (["any", "flat", "small", "average", "large", "bubble"], {
                    "default": "any"
                }),
                
                # Male Specific
                "penis_size": (["any", "small", "average", "large", "huge", "horse-hung"], {
                    "default": "any"
                }),
                "muscle_definition": (["any", "soft", "toned", "defined", "ripped", "bodybuilder"], {
                    "default": "any"
                }),
                "facial_hair": (["any", "clean-shaven", "stubble", "goatee", "mustache", "full beard"], {
                    "default": "any"
                }),
                
                # Advanced Settings
                "negative_prompt": ("STRING", {
                    "multiline": True,
                    "default": "blurry, low quality, distorted, ugly, bad anatomy",
                    "placeholder": "Negative prompt..."
                }),
                "aspect_ratio": (["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"], {
                    "default": "1:1"
                }),
                "seed": ("STRING", {
                    "default": "",
                    "placeholder": "Random seed (optional)"
                }),
                "additional_params": ("STRING", {
                    "default": "",
                    "placeholder": "Additional parameters..."
                }),
                
                # Presets
                "shot_presets": ("STRING", {
                    "default": "",
                    "placeholder": "Shot presets (comma-separated)"
                }),
                "pose_presets": ("STRING", {
                    "default": "",
                    "placeholder": "Pose presets (comma-separated)"
                }),
                "location_presets": ("STRING", {
                    "default": "",
                    "placeholder": "Location presets (comma-separated)"
                }),
                "clothing_presets": ("STRING", {
                    "default": "",
                    "placeholder": "Clothing presets (comma-separated)"
                }),
                
                # Quality and Style
                "use_break": ("BOOLEAN", {
                    "default": True
                }),
                "quality_tags": ("BOOLEAN", {
                    "default": True
                }),
            }
        }
    
    RETURN_TYPES = ("STRING", "STRING", "STRING", "STRING")
    RETURN_NAMES = ("positive_prompt", "negative_prompt", "enhanced_description", "formatted_prompt")
    FUNCTION = "generate_prompts"
    CATEGORY = "PromptBuilder"
    DESCRIPTION = "Advanced Prompt Builder with Local LLM - Full Feature Set"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'ComfyUI-PromptBuilder/2.0'
        })
        
        # Presets data
        self.shot_presets = {
            "close-up": "close-up shot, detailed face, intimate framing",
            "medium shot": "medium shot, waist up, balanced composition",
            "full body": "full body shot, head to toe, complete figure",
            "wide shot": "wide shot, environmental context, expansive view",
            "extreme close-up": "extreme close-up, macro detail, intense focus",
            "bird's eye": "bird's eye view, top-down perspective, aerial shot",
            "low angle": "low angle shot, dramatic perspective, powerful composition",
            "high angle": "high angle shot, looking down, diminished perspective"
        }
        
        self.pose_presets = {
            "standing": "standing pose, confident posture, natural stance",
            "sitting": "sitting pose, relaxed position, comfortable seating",
            "lying down": "lying down, reclining pose, horizontal position",
            "walking": "walking pose, dynamic movement, stride in motion",
            "running": "running pose, athletic movement, energetic motion",
            "dancing": "dancing pose, graceful movement, rhythmic expression",
            "jumping": "jumping pose, airborne moment, dynamic action",
            "crouching": "crouching pose, low position, bent knees"
        }
        
        self.location_presets = {
            "studio": "professional studio, controlled lighting, clean background",
            "outdoor": "outdoor setting, natural environment, open air",
            "beach": "beach location, sandy shore, ocean waves",
            "forest": "forest setting, trees and nature, woodland environment",
            "city": "urban cityscape, buildings and streets, metropolitan area",
            "bedroom": "bedroom interior, intimate space, private setting",
            "office": "office environment, professional workspace, business setting",
            "cafe": "cafe interior, cozy atmosphere, coffee shop ambiance"
        }
        
        self.clothing_presets = {
            "casual": "casual clothing, comfortable attire, everyday wear",
            "formal": "formal attire, elegant clothing, sophisticated dress",
            "business": "business attire, professional clothing, office wear",
            "swimwear": "swimwear, beach attire, swimming costume",
            "lingerie": "lingerie, intimate apparel, delicate undergarments",
            "sportswear": "sportswear, athletic clothing, fitness attire",
            "evening wear": "evening wear, glamorous dress, formal gown",
            "vintage": "vintage clothing, retro style, classic fashion"
        }
    
    def make_api_call(self, config: Dict[str, Any], messages: List[Dict[str, str]]) -> str:
        """
        Make API call to local LLM
        """
        # Validate API URL
        api_url = config.get('api_url', '').strip()
        if not api_url:
            raise Exception("API URL is empty. Please provide a valid local LLM API URL.")
        
        if not api_url.startswith(('http://', 'https://')):
            raise Exception(f"Invalid API URL format: {api_url}. Must start with http:// or https://")
        
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
                f"{api_url}/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'choices' not in data or not data['choices']:
                    raise Exception("Invalid API response: missing 'choices' field")
                return data['choices'][0]['message']['content']
            elif response.status_code == 404:
                raise Exception(f"API endpoint not found. Check if LLM server is running on {api_url}")
            elif response.status_code == 401:
                raise Exception("Authentication failed. Check API key if required.")
            elif response.status_code == 500:
                raise Exception("LLM server internal error. Check server logs.")
            else:
                raise Exception(f"API Error: {response.status_code} - {response.text}")
                
        except requests.exceptions.ConnectionError:
            raise Exception(f"Cannot connect to LLM server at {api_url}. Check if server is running.")
        except requests.exceptions.Timeout:
            raise Exception(f"LLM server timeout. Server at {api_url} is not responding.")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Connection Error: {str(e)}")
    
    def get_quality_tags(self, target_model: str, style_main: str, style_sub: str) -> List[str]:
        """
        Get quality tags based on model and style
        """
        if style_main == 'anime':
            return ['masterpiece', 'best quality', 'amazing quality', 'anime screenshot', 'absurdres']
        
        # Realistic styles
        if style_sub == 'professional':
            return ['photorealistic', 'professional photography', '8k', 'high detail', 'sharp focus', 'award-winning photograph']
        elif style_sub == 'amateur':
            return ['realistic photograph', 'candid shot', 'amateur photography', 'photographic grain', 'natural look', 'unposed']
        elif style_sub == 'flash':
            return ['flash photography', 'direct flash', 'harsh lighting', 'realistic', 'overexposed highlights', 'deep shadows', 'candid']
        else:
            return ['photorealistic', 'best quality', 'high detail']
    
    def build_character_description(self, **kwargs) -> str:
        """
        Build character description from settings with random support
        """
        parts = []
        
        # Set up random seed if provided
        random_seed = kwargs.get('random_seed', -1)
        if random_seed != -1:
            random.seed(random_seed)
        
        # Handle random gender selection
        gender = kwargs.get('gender', 'any')
        if gender == 'random':
            gender = random.choice(['male', 'female'])
        
        # Basic demographics
        if gender and gender != 'any':
            parts.append(gender)
        
        # Random age if enabled
        age_range = kwargs.get('age_range', 'any')
        if kwargs.get('enable_random_generation') and age_range == 'any':
            age_range = random.choice(['18s', '25s', '30s', '40s', '50s'])
        
        if age_range and age_range != 'any':
            parts.append(f"{age_range} years old")
        
        # Random ethnicity if enabled
        ethnicity = kwargs.get('ethnicity', 'any')
        if kwargs.get('enable_random_generation') and ethnicity == 'any':
            ethnicity_options = ['caucasian', 'european', 'asian', 'japanese', 'chinese', 'korean', 'african', 'hispanic']
            ethnicity = random.choice(ethnicity_options)
        
        if ethnicity and ethnicity != 'any':
            parts.append(ethnicity)
        
        # Random body type if enabled
        body_type = kwargs.get('body_type', 'any')
        if kwargs.get('enable_random_generation') and body_type == 'any':
            if gender == 'female':
                body_type = random.choice(['slim', 'curvy', 'athletic', 'instagram model'])
            elif gender == 'male':
                body_type = random.choice(['slim', 'muscular', 'athletic', 'big muscular'])
        
        if body_type and body_type != 'any':
            parts.append(f"{body_type} body type")
        
        # Random height if enabled
        height_range = kwargs.get('height_range', 'any')
        if kwargs.get('enable_random_generation') and height_range == 'any':
            height_range = random.choice(['short (150-165cm)', 'average (165-180cm)', 'tall (>180cm)'])
        
        if height_range and height_range != 'any':
            parts.append(height_range)
        
        # Gender-specific attributes with random support
        if gender == 'female':
            breast_size = kwargs.get('breast_size', 'any')
            if kwargs.get('enable_random_generation') and breast_size == 'any':
                breast_size = random.choice(['small', 'medium', 'large'])
            if breast_size and breast_size != 'any':
                parts.append(f"{breast_size} breasts")
            
            hips_size = kwargs.get('hips_size', 'any')
            if kwargs.get('enable_random_generation') and hips_size == 'any':
                hips_size = random.choice(['narrow', 'average', 'wide'])
            if hips_size and hips_size != 'any':
                parts.append(f"{hips_size} hips")
            
            butt_size = kwargs.get('butt_size', 'any')
            if kwargs.get('enable_random_generation') and butt_size == 'any':
                butt_size = random.choice(['small', 'average', 'large'])
            if butt_size and butt_size != 'any':
                parts.append(f"{butt_size} butt")
        
        if gender == 'male':
            muscle_definition = kwargs.get('muscle_definition', 'any')
            if kwargs.get('enable_random_generation') and muscle_definition == 'any':
                muscle_definition = random.choice(['toned', 'defined', 'ripped'])
            if muscle_definition and muscle_definition != 'any':
                parts.append(f"{muscle_definition} muscles")
            
            facial_hair = kwargs.get('facial_hair', 'any')
            if kwargs.get('enable_random_generation') and facial_hair == 'any':
                facial_hair = random.choice(['clean-shaven', 'stubble', 'goatee', 'full beard'])
            if facial_hair and facial_hair != 'any':
                parts.append(facial_hair)
            
            if kwargs.get('nsfw_mode') != 'off':
                penis_size = kwargs.get('penis_size', 'any')
                if kwargs.get('enable_random_generation') and penis_size == 'any':
                    penis_size = random.choice(['average', 'large'])
                if penis_size and penis_size != 'any':
                    parts.append(f"{penis_size} penis")
        
        return ', '.join(parts) if parts else ''
    
    def apply_presets(self, preset_string: str, preset_dict: Dict[str, str]) -> List[str]:
        """
        Apply presets from comma-separated string
        """
        if not preset_string.strip():
            return []
        
        presets = [p.strip().lower() for p in preset_string.split(',')]
        applied = []
        
        for preset in presets:
            if preset in preset_dict:
                applied.append(preset_dict[preset])
        
        return applied
    
    def create_system_prompt(self, target_model: str, style_main: str, style_sub: str, nsfw_mode: str, **kwargs) -> str:
        """
        Create comprehensive system prompt for LLM
        """
        style_guidance = {
            "realistic": "Focus on photorealistic, detailed descriptions. Include lighting, composition, and technical photography terms.",
            "anime": "Focus on anime and manga style descriptions. Include character design elements and anime-specific terminology."
        }
        
        nsfw_guidance = ""
        if nsfw_mode == "nsfw":
            nsfw_guidance = "Include tasteful adult content and suggestive elements as appropriate."
        elif nsfw_mode == "hardcore":
            nsfw_guidance = "Include explicit adult content and detailed intimate descriptions as appropriate."
        
        # Check if random generation is enabled
        random_mode = kwargs.get('enable_random_generation', False)
        random_guidance = ""
        if random_mode:
            random_intensity = kwargs.get('random_intensity', 0.5)
            random_guidance = f"\n\nRANDOM MODE ENABLED (Intensity: {random_intensity}):\n- Generate creative and unexpected elements\n- Add surprising details and compositions\n- Be more imaginative and artistic\n- Include unique and interesting variations"
        
        return f"""You are an advanced AI assistant specialized in generating detailed image prompts for the {target_model} model.

Target Model: {target_model}
Style: {style_main} ({style_sub})
NSFW Mode: {nsfw_mode}

Style Guidance: {style_guidance.get(style_main, style_guidance['realistic'])}
{nsfw_guidance}{random_guidance}

Generate enhanced prompts that are:
1. Highly detailed and specific
2. Optimized for {target_model}
3. Appropriate for {style_main} style
4. Include relevant technical terms
5. Consider lighting, composition, and atmosphere

Return a JSON object with:
{{
    "positive": "detailed positive prompt",
    "negative": "negative prompt elements",
    "enhanced_description": "enhanced scene description"
}}"""
    
    def generate_prompts(self, description: str, api_url: str, model_name: str, target_model: str,
                        style_main: str, style_sub: str, num_variations: int, **kwargs) -> Tuple[str, str, str, str]:
        """
        Generate enhanced prompts with full feature set
        """
        try:
            # Build character description
            character_desc = self.build_character_description(**kwargs)
            
            # Apply presets
            shot_elements = self.apply_presets(kwargs.get('shot_presets', ''), self.shot_presets)
            pose_elements = self.apply_presets(kwargs.get('pose_presets', ''), self.pose_presets)
            location_elements = self.apply_presets(kwargs.get('location_presets', ''), self.location_presets)
            clothing_elements = self.apply_presets(kwargs.get('clothing_presets', ''), self.clothing_presets)
            
            # Combine all elements
            full_description = description
            if character_desc:
                full_description += f", {character_desc}"
            
            preset_elements = shot_elements + pose_elements + location_elements + clothing_elements
            if preset_elements:
                full_description += f", {', '.join(preset_elements)}"
            
            # Create system prompt
            nsfw_mode = kwargs.get('nsfw_mode', 'off')
            # Remove nsfw_mode from kwargs to avoid duplicate argument error
            kwargs_copy = kwargs.copy()
            kwargs_copy.pop('nsfw_mode', None)
            system_prompt = self.create_system_prompt(target_model, style_main, style_sub, nsfw_mode, **kwargs_copy)
            
            # API configuration
            config = {
                'api_url': api_url.rstrip('/'),
                'model_name': model_name,
                'api_key': kwargs.get('api_key', ''),
                'temperature': kwargs.get('temperature', 0.7),
                'max_tokens': kwargs.get('max_tokens', 2000)
            }
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Create enhanced prompts for: {full_description}"}
            ]
            
            response = self.make_api_call(config, messages)
            
            # Parse response
            try:
                result = json.loads(response)
                positive_prompt = result.get('positive', full_description)
                negative_prompt = result.get('negative', kwargs.get('negative_prompt', 'blurry, low quality, distorted'))
                enhanced_description = result.get('enhanced_description', full_description)
            except json.JSONDecodeError:
                positive_prompt = response
                negative_prompt = kwargs.get('negative_prompt', 'blurry, low quality, distorted')
                enhanced_description = response
            
            # Add quality tags if enabled
            if kwargs.get('quality_tags', True):
                quality_tags = self.get_quality_tags(target_model, style_main, style_sub)
                positive_prompt = ', '.join(quality_tags) + ', ' + positive_prompt
            
            # Format final prompt based on target model
            formatted_prompt = self.format_for_model(positive_prompt, target_model, kwargs)
            
            return (positive_prompt, negative_prompt, enhanced_description, formatted_prompt)
            
        except Exception as e:
            error_msg = f"❌ LLM API Error: {str(e)}"
            print(f"PromptBuilder Local Node Error: {error_msg}")
            # Return clear error messages instead of fallback to description
            error_prompt = f"❌ ERROR: Local LLM not responding. Check API URL and model. Original: {description}"
            return (error_prompt, 'blurry, low quality, distorted', error_msg, error_prompt)
    
    def format_for_model(self, prompt: str, target_model: str, kwargs: Dict[str, Any]) -> str:
        """
        Format prompt according to target model requirements
        """
        formatted = prompt
        
        # Add BREAK tokens for supported models
        if kwargs.get('use_break', True) and target_model in ['SDXL', 'Pony', 'Stable Cascade']:
            # Insert BREAK every 75 tokens (approximate)
            words = formatted.split()
            if len(words) > 75:
                mid_point = len(words) // 2
                words.insert(mid_point, 'BREAK')
                formatted = ' '.join(words)
        
        # Add model-specific formatting
        if target_model == 'MidJourney':
            formatted = f"/imagine prompt: {formatted}"
            if kwargs.get('aspect_ratio'):
                formatted += f" --ar {kwargs['aspect_ratio']}"
            if kwargs.get('seed'):
                formatted += f" --seed {kwargs['seed']}"
        
        return formatted

class PromptBuilderOnlineNode:
    """
    Advanced ComfyUI Node for Prompt Builder with Online LLM APIs - Full Feature Set
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
                "api_provider": (["google_gemini", "openai", "claude", "deepseek", "groq", "together", "perplexity", "cohere"], {
                    "default": "openai"
                }),
                "api_key": ("STRING", {
                    "default": "",
                    "placeholder": "API Key (required)"
                }),
                "target_model": (["SDXL", "Pony", "SD 1.5", "Flux", "Google Imagen4", "OpenAI", "MidJourney", "Illustrious", "NoobAI"], {
                    "default": "SDXL"
                }),
                "style_main": (["realistic", "anime"], {
                    "default": "realistic"
                }),
                "style_sub": (["professional", "amateur", "flash", "ghibli", "naruto", "bleach"], {
                    "default": "professional"
                }),
                "num_variations": ("INT", {
                    "default": 3,
                    "min": 1,
                    "max": 10,
                    "step": 1
                }),
            },
            "optional": {
                # API Configuration
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
                
                # NSFW Settings
                "nsfw_mode": (["off", "nsfw", "hardcore"], {
                    "default": "off"
                }),
                "nsfw_level": ("INT", {
                    "default": 5,
                    "min": 1,
                    "max": 10,
                    "step": 1
                }),
                "hardcore_level": ("INT", {
                    "default": 5,
                    "min": 1,
                    "max": 10,
                    "step": 1
                }),
                "enhance_person": ("BOOLEAN", {
                    "default": True
                }),
                "enhance_pose": ("BOOLEAN", {
                    "default": True
                }),
                "enhance_location": ("BOOLEAN", {
                    "default": True
                }),
                "ai_imagination": ("BOOLEAN", {
                    "default": True
                }),
                
                # Character Settings (same as Local node)
                "gender": (["any", "male", "female", "mixed", "random"], {
                    "default": "any"
                }),
                "random_seed": ("INT", {
                    "default": -1,
                    "min": -1,
                    "max": 999999,
                    "step": 1
                }),
                "enable_random_generation": ("BOOLEAN", {
                    "default": False
                }),
                "random_intensity": ("FLOAT", {
                    "default": 0.5,
                    "min": 0.1,
                    "max": 1.0,
                    "step": 0.1
                }),
                "age_range": (["any", "18s", "25s", "30s", "40s", "50s", "60s", "70+"], {
                    "default": "any"
                }),
                "body_type": (["any", "slim", "curvy", "athletic", "instagram model", "fat", "muscular", "big muscular"], {
                    "default": "any"
                }),
                "ethnicity": (["any", "caucasian", "european", "scandinavian", "slavic", "mediterranean", "asian", "japanese", "chinese", "korean", "indian", "african", "hispanic", "middle eastern", "native american"], {
                    "default": "any"
                }),
                "height_range": (["any", "very short (<150cm)", "short (150-165cm)", "average (165-180cm)", "tall (>180cm)"], {
                    "default": "any"
                }),
                
                # Female Specific
                "breast_size": (["any", "flat", "small", "medium", "large", "huge", "gigantic"], {
                    "default": "any"
                }),
                "hips_size": (["any", "narrow", "average", "wide", "extra wide"], {
                    "default": "any"
                }),
                "butt_size": (["any", "flat", "small", "average", "large", "bubble"], {
                    "default": "any"
                }),
                
                # Male Specific
                "penis_size": (["any", "small", "average", "large", "huge", "horse-hung"], {
                    "default": "any"
                }),
                "muscle_definition": (["any", "soft", "toned", "defined", "ripped", "bodybuilder"], {
                    "default": "any"
                }),
                "facial_hair": (["any", "clean-shaven", "stubble", "goatee", "mustache", "full beard"], {
                    "default": "any"
                }),
                
                # Advanced Settings
                "negative_prompt": ("STRING", {
                    "multiline": True,
                    "default": "blurry, low quality, distorted, ugly, bad anatomy",
                    "placeholder": "Negative prompt..."
                }),
                "aspect_ratio": (["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"], {
                    "default": "1:1"
                }),
                "seed": ("STRING", {
                    "default": "",
                    "placeholder": "Random seed (optional)"
                }),
                "additional_params": ("STRING", {
                    "default": "",
                    "placeholder": "Additional parameters..."
                }),
                
                # Presets
                "shot_presets": ("STRING", {
                    "default": "",
                    "placeholder": "Shot presets (comma-separated)"
                }),
                "pose_presets": ("STRING", {
                    "default": "",
                    "placeholder": "Pose presets (comma-separated)"
                }),
                "location_presets": ("STRING", {
                    "default": "",
                    "placeholder": "Location presets (comma-separated)"
                }),
                "clothing_presets": ("STRING", {
                    "default": "",
                    "placeholder": "Clothing presets (comma-separated)"
                }),
                
                # Quality and Style
                "use_break": ("BOOLEAN", {
                    "default": True
                }),
                "quality_tags": ("BOOLEAN", {
                    "default": True
                }),
            }
        }
    
    RETURN_TYPES = ("STRING", "STRING", "STRING", "STRING")
    RETURN_NAMES = ("positive_prompt", "negative_prompt", "enhanced_description", "formatted_prompt")
    FUNCTION = "generate_prompts"
    CATEGORY = "PromptBuilder"
    DESCRIPTION = "Advanced Prompt Builder with Online LLM APIs - Full Feature Set"
    
    def __init__(self):
        # Inherit all methods from PromptBuilderLocalNode
        local_node = PromptBuilderLocalNode()
        self.shot_presets = local_node.shot_presets
        self.pose_presets = local_node.pose_presets
        self.location_presets = local_node.location_presets
        self.clothing_presets = local_node.clothing_presets
        
        # Online API endpoints
        self.api_endpoints = {
            "openai": "https://api.openai.com/v1/chat/completions",
            "claude": "https://api.anthropic.com/v1/messages",
            "google_gemini": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
            "deepseek": "https://api.deepseek.com/v1/chat/completions",
            "groq": "https://api.groq.com/openai/v1/chat/completions",
            "together": "https://api.together.xyz/v1/chat/completions",
            "perplexity": "https://api.perplexity.ai/chat/completions",
            "cohere": "https://api.cohere.ai/v1/chat"
        }
        
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'ComfyUI-PromptBuilder-Online/2.0'
        })
    
    def make_online_api_call(self, provider: str, api_key: str, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Make API call to online LLM providers
        """
        if not api_key:
            raise Exception("API key is required for online providers")
        
        endpoint = self.api_endpoints.get(provider)
        if not endpoint:
            raise Exception(f"Unsupported provider: {provider}")
        
        headers = {'Content-Type': 'application/json'}
        
        # Provider-specific headers and payload formatting
        if provider == "openai":
            headers['Authorization'] = f"Bearer {api_key}"
            payload = {
                "model": "gpt-4",
                "messages": messages,
                "temperature": kwargs.get('temperature', 0.7),
                "max_tokens": kwargs.get('max_tokens', 2000)
            }
        elif provider == "claude":
            headers['x-api-key'] = api_key
            headers['anthropic-version'] = '2023-06-01'
            payload = {
                "model": "claude-3-sonnet-20240229",
                "messages": messages,
                "temperature": kwargs.get('temperature', 0.7),
                "max_tokens": kwargs.get('max_tokens', 2000)
            }
        elif provider == "google_gemini":
            headers['x-goog-api-key'] = api_key
            # Convert messages to Gemini format
            content = messages[-1]['content'] if messages else ""
            payload = {
                "contents": [{"parts": [{"text": content}]}],
                "generationConfig": {
                    "temperature": kwargs.get('temperature', 0.7),
                    "maxOutputTokens": kwargs.get('max_tokens', 2000)
                }
            }
        else:
            # Generic OpenAI-compatible format
            headers['Authorization'] = f"Bearer {api_key}"
            payload = {
                "model": "mixtral-8x7b-32768" if provider == "groq" else "meta-llama/Llama-2-70b-chat-hf",
                "messages": messages,
                "temperature": kwargs.get('temperature', 0.7),
                "max_tokens": kwargs.get('max_tokens', 2000)
            }
        
        try:
            response = self.session.post(endpoint, headers=headers, json=payload, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract response based on provider
                if provider == "google_gemini":
                    return data['candidates'][0]['content']['parts'][0]['text']
                elif provider == "claude":
                    return data['content'][0]['text']
                else:
                    return data['choices'][0]['message']['content']
            else:
                raise Exception(f"API Error: {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Connection Error: {str(e)}")
    
    # Inherit methods from PromptBuilderLocalNode
    def get_quality_tags(self, target_model: str, style_main: str, style_sub: str) -> List[str]:
        local_node = PromptBuilderLocalNode()
        return local_node.get_quality_tags(target_model, style_main, style_sub)
    
    def build_character_description(self, **kwargs) -> str:
        local_node = PromptBuilderLocalNode()
        return local_node.build_character_description(**kwargs)
    
    def apply_presets(self, preset_string: str, preset_dict: Dict[str, str]) -> List[str]:
        local_node = PromptBuilderLocalNode()
        return local_node.apply_presets(preset_string, preset_dict)
    
    def create_system_prompt(self, target_model: str, style_main: str, style_sub: str, nsfw_mode: str, **kwargs) -> str:
        local_node = PromptBuilderLocalNode()
        return local_node.create_system_prompt(target_model, style_main, style_sub, nsfw_mode, **kwargs)
    
    def format_for_model(self, prompt: str, target_model: str, kwargs: Dict[str, Any]) -> str:
        local_node = PromptBuilderLocalNode()
        return local_node.format_for_model(prompt, target_model, kwargs)
    
    def generate_prompts(self, description: str, api_provider: str, api_key: str, target_model: str,
                        style_main: str, style_sub: str, num_variations: int, **kwargs) -> Tuple[str, str, str, str]:
        """
        Generate enhanced prompts using online LLM APIs
        """
        try:
            # Build character description
            character_desc = self.build_character_description(**kwargs)
            
            # Apply presets
            shot_elements = self.apply_presets(kwargs.get('shot_presets', ''), self.shot_presets)
            pose_elements = self.apply_presets(kwargs.get('pose_presets', ''), self.pose_presets)
            location_elements = self.apply_presets(kwargs.get('location_presets', ''), self.location_presets)
            clothing_elements = self.apply_presets(kwargs.get('clothing_presets', ''), self.clothing_presets)
            
            # Combine all elements
            full_description = description
            if character_desc:
                full_description += f", {character_desc}"
            
            preset_elements = shot_elements + pose_elements + location_elements + clothing_elements
            if preset_elements:
                full_description += f", {', '.join(preset_elements)}"
            
            # Create system prompt
            nsfw_mode = kwargs.get('nsfw_mode', 'off')
            # Remove nsfw_mode from kwargs to avoid duplicate argument error
            kwargs_copy = kwargs.copy()
            kwargs_copy.pop('nsfw_mode', None)
            system_prompt = self.create_system_prompt(target_model, style_main, style_sub, nsfw_mode, **kwargs_copy)
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Create enhanced prompts for: {full_description}"}
            ]
            
            response = self.make_online_api_call(api_provider, api_key, messages, **kwargs)
            
            # Parse response
            try:
                result = json.loads(response)
                positive_prompt = result.get('positive', full_description)
                negative_prompt = result.get('negative', kwargs.get('negative_prompt', 'blurry, low quality, distorted'))
                enhanced_description = result.get('enhanced_description', full_description)
            except json.JSONDecodeError:
                positive_prompt = response
                negative_prompt = kwargs.get('negative_prompt', 'blurry, low quality, distorted')
                enhanced_description = response
            
            # Add quality tags if enabled
            if kwargs.get('quality_tags', True):
                quality_tags = self.get_quality_tags(target_model, style_main, style_sub)
                positive_prompt = ', '.join(quality_tags) + ', ' + positive_prompt
            
            # Format final prompt based on target model
            formatted_prompt = self.format_for_model(positive_prompt, target_model, kwargs)
            
            return (positive_prompt, negative_prompt, enhanced_description, formatted_prompt)
            
        except Exception as e:
            error_msg = f"❌ Online LLM API Error: {str(e)}"
            print(f"PromptBuilder Online Node Error: {error_msg}")
            # Return clear error messages instead of fallback to description
            error_prompt = f"❌ ERROR: Online LLM API failed. Check API key and provider. Original: {description}"
            return (error_prompt, 'blurry, low quality, distorted', error_msg, error_prompt)

class PromptTextDisplayNode:
    """
    Text Display Node - Shows generated prompts directly in ComfyUI interface
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "positive_prompt": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
                "negative_prompt": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
                "enhanced_description": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
                "formatted_prompt": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
            },
            "optional": {
                "show_in_ui": ("BOOLEAN", {
                    "default": True
                }),
            }
        }
    
    RETURN_TYPES = ("STRING", "STRING")
    RETURN_NAMES = ("positive_for_clip", "negative_for_clip")
    FUNCTION = "display_text"
    CATEGORY = "PromptBuilder"
    DESCRIPTION = "Display generated prompts as text in ComfyUI interface"
    OUTPUT_NODE = True  # This makes the node show output in UI
    
    def display_text(self, positive_prompt: str, negative_prompt: str, 
                    enhanced_description: str, formatted_prompt: str,
                    show_in_ui: bool = True) -> Tuple[str, str]:
        """
        Display prompts as text in ComfyUI interface
        """
        if show_in_ui:
            # This will be displayed in the ComfyUI interface
            print("\n" + "="*80)
            print("🎨 PROMPT BUILDER RESULTS")
            print("="*80)
            print(f"📝 POSITIVE PROMPT ({len(positive_prompt)} chars):")
            print(positive_prompt)
            print("\n" + "-"*40)
            print(f"❌ NEGATIVE PROMPT ({len(negative_prompt)} chars):")
            print(negative_prompt)
            print("\n" + "-"*40)
            print(f"✨ ENHANCED DESCRIPTION ({len(enhanced_description)} chars):")
            print(enhanced_description)
            print("\n" + "-"*40)
            print(f"🎯 FORMATTED PROMPT ({len(formatted_prompt)} chars):")
            print(formatted_prompt)
            print("="*80 + "\n")
        
        return (positive_prompt, negative_prompt)

class PromptDisplayNode:
    """
    Display Node for Prompt Builder - Shows generated prompts in readable format
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "positive_prompt": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
                "negative_prompt": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
                "enhanced_description": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
                "formatted_prompt": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
            },
            "optional": {
                "display_mode": (["all", "positive_only", "negative_only", "formatted_only"], {
                    "default": "all"
                }),
                "add_separators": ("BOOLEAN", {
                    "default": True
                }),
                "show_stats": ("BOOLEAN", {
                    "default": True
                }),
            }
        }
    
    RETURN_TYPES = ("STRING", "STRING", "STRING")
    RETURN_NAMES = ("display_text", "positive_for_clip", "negative_for_clip")
    FUNCTION = "display_prompts"
    CATEGORY = "PromptBuilder"
    DESCRIPTION = "Display and format Prompt Builder results for easy viewing and CLIP connection"
    
    def display_prompts(self, positive_prompt: str, negative_prompt: str, 
                       enhanced_description: str, formatted_prompt: str,
                       display_mode: str = "all", add_separators: bool = True, 
                       show_stats: bool = True) -> Tuple[str, str, str]:
        """
        Display prompts in readable format
        """
        try:
            # Prepare display text based on mode
            display_parts = []
            
            if display_mode in ["all", "positive_only"]:
                if add_separators:
                    display_parts.append("=== POSITIVE PROMPT ===")
                display_parts.append(positive_prompt)
                
                if show_stats:
                    pos_words = len(positive_prompt.split())
                    pos_chars = len(positive_prompt)
                    display_parts.append(f"[Stats: {pos_words} words, {pos_chars} characters]")
                
                if add_separators and display_mode == "all":
                    display_parts.append("")
            
            if display_mode in ["all", "negative_only"]:
                if add_separators:
                    display_parts.append("=== NEGATIVE PROMPT ===")
                display_parts.append(negative_prompt)
                
                if show_stats:
                    neg_words = len(negative_prompt.split())
                    neg_chars = len(negative_prompt)
                    display_parts.append(f"[Stats: {neg_words} words, {neg_chars} characters]")
                
                if add_separators and display_mode == "all":
                    display_parts.append("")
            
            if display_mode in ["all", "formatted_only"]:
                if add_separators:
                    display_parts.append("=== FORMATTED PROMPT ===")
                display_parts.append(formatted_prompt)
                
                if show_stats:
                    fmt_words = len(formatted_prompt.split())
                    fmt_chars = len(formatted_prompt)
                    display_parts.append(f"[Stats: {fmt_words} words, {fmt_chars} characters]")
                
                if add_separators and display_mode == "all":
                    display_parts.append("")
            
            if display_mode == "all":
                if add_separators:
                    display_parts.append("=== ENHANCED DESCRIPTION ===")
                display_parts.append(enhanced_description)
                
                if show_stats:
                    desc_words = len(enhanced_description.split())
                    desc_chars = len(enhanced_description)
                    display_parts.append(f"[Stats: {desc_words} words, {desc_chars} characters]")
            
            # Join all parts
            display_text = "\n".join(display_parts)
            
            # Return display text and clean prompts for CLIP
            return (display_text, positive_prompt, negative_prompt)
            
        except Exception as e:
            error_msg = f"Error displaying prompts: {str(e)}"
            print(f"PromptDisplay Node Error: {error_msg}")
            return (error_msg, positive_prompt, negative_prompt)

class PromptSelectorNode:
    """
    Selector Node for Prompt Builder - Choose between different prompt outputs
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "positive_prompt": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
                "negative_prompt": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
                "enhanced_description": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
                "formatted_prompt": ("STRING", {
                    "multiline": True,
                    "forceInput": True
                }),
                "output_selection": (["positive", "formatted", "enhanced"], {
                    "default": "formatted"
                }),
            },
            "optional": {
                "custom_prefix": ("STRING", {
                    "default": "",
                    "placeholder": "Custom prefix to add..."
                }),
                "custom_suffix": ("STRING", {
                    "default": "",
                    "placeholder": "Custom suffix to add..."
                }),
                "remove_quality_tags": ("BOOLEAN", {
                    "default": False
                }),
            }
        }
    
    RETURN_TYPES = ("STRING", "STRING")
    RETURN_NAMES = ("selected_positive", "selected_negative")
    FUNCTION = "select_prompt"
    CATEGORY = "PromptBuilder"
    DESCRIPTION = "Select and customize specific prompt output from Prompt Builder"
    
    def select_prompt(self, positive_prompt: str, negative_prompt: str,
                     enhanced_description: str, formatted_prompt: str,
                     output_selection: str = "formatted", custom_prefix: str = "",
                     custom_suffix: str = "", remove_quality_tags: bool = False) -> Tuple[str, str]:
        """
        Select and customize prompt output
        """
        try:
            # Select the appropriate prompt
            if output_selection == "positive":
                selected = positive_prompt
            elif output_selection == "formatted":
                selected = formatted_prompt
            elif output_selection == "enhanced":
                selected = enhanced_description
            else:
                selected = positive_prompt
            
            # Remove quality tags if requested
            if remove_quality_tags:
                # Remove common quality tags
                quality_tags = [
                    "masterpiece", "best quality", "amazing quality", "photorealistic",
                    "professional photography", "8k", "high detail", "sharp focus",
                    "award-winning photograph", "anime screenshot", "absurdres"
                ]
                
                for tag in quality_tags:
                    selected = selected.replace(f"{tag}, ", "")
                    selected = selected.replace(f", {tag}", "")
                    selected = selected.replace(tag, "")
                
                # Clean up extra commas and spaces
                selected = ", ".join([part.strip() for part in selected.split(",") if part.strip()])
            
            # Add custom prefix and suffix
            if custom_prefix:
                selected = f"{custom_prefix}, {selected}"
            
            if custom_suffix:
                selected = f"{selected}, {custom_suffix}"
            
            # Clean up the final result
            selected = selected.strip().strip(",").strip()
            
            return (selected, negative_prompt)
            
        except Exception as e:
            error_msg = f"Error selecting prompt: {str(e)}"
            print(f"PromptSelector Node Error: {error_msg}")
            return (positive_prompt, negative_prompt)

# Node registration
NODE_CLASS_MAPPINGS = {
    "PromptBuilderLocalNode": PromptBuilderLocalNode,
    "PromptBuilderOnlineNode": PromptBuilderOnlineNode,
    "PromptTextDisplayNode": PromptTextDisplayNode,
    "PromptDisplayNode": PromptDisplayNode,
    "PromptSelectorNode": PromptSelectorNode
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptBuilderLocalNode": "Prompt Builder (Local LLM)",
    "PromptBuilderOnlineNode": "Prompt Builder (Online LLM)",
    "PromptTextDisplayNode": "📝 Prompt Text Display",
    "PromptDisplayNode": "Prompt Display & Stats",
    "PromptSelectorNode": "Prompt Selector & Customizer"
}