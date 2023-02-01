
curl https://api.openai.com/v1/models \
  -H 'Authorization: Bearer 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' \
  -H 'OpenAI-Organization: org-46egR71xnHn3VMvtHAL0qe4C'


curl https://api.openai.com/v1/images/generations \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer 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' \
  -d '{
  "prompt": "A real dancing girls ride a white horse",
  "n": 2,
  "size": "1024x1024"
}'


curl https://api.openai.com/v1/images/generations \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer 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' \
  -d '{
  "prompt": "the best future car in the world",
  "n": 2,
  "size": "1024x1024"
}'
