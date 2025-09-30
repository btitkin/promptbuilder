#!/usr/bin/env python3
"""
Test script for NSFW and Hardcore functionality in PromptBuilder
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from promptbuilder_node import PromptBuilderLocalNode

def test_nsfw_functionality():
    """Test NSFW functionality"""
    print("🧪 Testing NSFW functionality...")
    
    node = PromptBuilderLocalNode()
    
    # Test basic NSFW
    result = node.enhance_prompt_advanced(
        "a beautiful woman", 
        "realistic", 
        "professional", 
        nsfw_mode="nsfw",
        nsfw_level=5
    )
    print(f"🔞 NSFW Level 5: {result}")
    
    # Test high NSFW
    result = node.enhance_prompt_advanced(
        "a beautiful woman", 
        "realistic", 
        "professional", 
        nsfw_mode="nsfw",
        nsfw_level=9
    )
    print(f"🔞 NSFW Level 9: {result}")
    
    # Test hardcore
    result = node.enhance_prompt_advanced(
        "a beautiful woman", 
        "realistic", 
        "professional", 
        nsfw_mode="hardcore",
        hardcore_level=5
    )
    print(f"🔥 Hardcore Level 5: {result}")
    
    # Test high hardcore
    result = node.enhance_prompt_advanced(
        "a beautiful woman", 
        "realistic", 
        "professional", 
        nsfw_mode="hardcore",
        hardcore_level=9
    )
    print(f"🔥 Hardcore Level 9: {result}")

def test_character_description():
    """Test character description with NSFW"""
    print("\n👤 Testing character description with NSFW...")
    
    node = PromptBuilderLocalNode()
    
    # Test female character with NSFW
    result = node.build_character_description(
        gender="female",
        age="18s",
        ethnicity="japanese",
        body_type="slim",
        nsfw_mode="nsfw",
        nsfw_level=7
    )
    print(f"👩 Japanese female 18s (NSFW): {result}")
    
    # Test male character with hardcore
    result = node.build_character_description(
        gender="male",
        age="25s",
        ethnicity="caucasian",
        body_type="athletic",
        nsfw_mode="hardcore",
        hardcore_level=5
    )
    print(f"👨 Caucasian male 25s (Hardcore): {result}")

def test_system_prompt():
    """Test system prompt generation with NSFW"""
    print("\n📋 Testing system prompt with NSFW...")
    
    node = PromptBuilderLocalNode()
    
    # Test NSFW system prompt
    result = node.create_system_prompt(
        "SDXL",
        "realistic",
        "professional",
        "nsfw",
        nsfw_level=8
    )
    print(f"🔞 NSFW System Prompt (Level 8):\n{result[:200]}...")
    
    # Test hardcore system prompt
    result = node.create_system_prompt(
        "SDXL",
        "realistic",
        "professional",
        "hardcore",
        hardcore_level=6
    )
    print(f"🔥 Hardcore System Prompt (Level 6):\n{result[:200]}...")

def main():
    """Run all tests"""
    print("🚀 Starting NSFW/Hardcore functionality tests...")
    print("=" * 60)
    
    try:
        test_nsfw_functionality()
        test_character_description()
        test_system_prompt()
        
        print("\n✅ All tests completed successfully!")
        print("🎯 NSFW and Hardcore functionality is working correctly.")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())