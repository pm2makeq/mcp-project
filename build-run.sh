#!/bin/bash
set -e  # 오류 발생 시 스크립트 종료

# 1. 빌드 실행
npm run build

# 2. 빌드된 파일 실행
node src/index.js --port=8000
