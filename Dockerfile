FROM node:20.16.0-alpine as builder

# 작업 디렉토리 생성
RUN mkdir -p /usr/src/app

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 설정 복사
COPY package*.json ./

# 패키지 설치
RUN npm install --force

# views와 public 폴더 먼저 복사
COPY ./views ./views/
COPY ./public ./public/

# 나머지 소스 복사
COPY . .

# 빌드 실행
RUN npm run build

# 복사 확인
RUN ls -la /usr/src/app/ && \
    echo "=== views 디렉토리 ===" && \
    ls -la /usr/src/app/views/ && \
    echo "=== public 디렉토리 ===" && \
    ls -la /usr/src/app/public/

EXPOSE 3000

CMD ["node","dist/main.js"]