#!/bin/bash
# MedPup Email Setup Wait Script
# Waits for the user to update email-config.json with a valid App Password (16 characters)

CONFIG_FILE="/c/Users/camer/DEVNEW/AnimalAid/email-config.json"
MAX_ATTEMPTS=5
ATTEMPT=0

echo "Waiting for App Password to be configured in $CONFIG_FILE"
echo "Please generate a 16-character App Password at https://myaccount.google.com/apppasswords"
echo "and update the smtp_password field in $CONFIG_FILE"

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT primitive))
  echo "Attempt $((ATTEMPT+1))/$MAX_ATTEMPTS: Checking password length..."
  
  # Extract the password from JSON (simple extraction, assumes no escaping)
  PASSWORD=$(grep -o '"smtp_password": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
  
  if [ -z "$PASSWORD" ]; then
    echo "Could not find smtp_password in $CONFIG_FILE"
  else
    # Remove any trailing whitespace or newline
    PASSWORD=$(echo "$PASSWORD" | tr -d '[:space:]')
    echo "Password length: ${#PASSWORD}"
    
    if [ ${#PASSWORD} -eq 16 ]; then
      echo "Valid App Password detected (16 characters). Testing email configuration..."
      # Test the configuration
      cd /c/Users/camer/DEVNEW/AnimalAid && python scripts/validate_email_config.py
      if [ $? -eq 0 ]; then
        echo "Email configuration is now working!"
        exit 0
      else
        echo "Email configuration test failed. Please check your settings."
      fi
    else
      echo "Password is not 16 characters. Please update with a valid App Password."
    fi
  fi
  
  if [ $ATTEMPT -lt $((MAX_ATTEMPTS-1)) ]; then
    echo "Waiting 10 seconds before next check..."
    sleep 10
  fi
done

echo "Maximum attempts reached. Please update $CONFIG_FILE with a valid 16-character App Password and run the validation script manually."
echo "You can run: python scripts/validate_email_config.py"
exit 1