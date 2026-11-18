# Locked look lives in a package, not in an episode
Problem: fine-tuning done inside one episode's script is lost for the next one. Fix: templates/blender_look/ + tools/check_episode.py; each episode only supplies props, staging and a preset. Detect: an episode build that defines its own materials or grade.
