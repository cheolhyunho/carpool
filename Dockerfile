# NODE V20.16.0 - alpine 
FROM node:20.16.0-alpine as builder

# 작업 디렉토리 생성
RUN mkdir -p /usr/src/app

# 작업 디렉토리 설정
WORKDIR /usr/src/app


# 패키지 설정 복사
COPY package*.json ./


# 패키지 설치 및 빌드
RUN npm install --force

COPY . .

RUN npm run build

# 3000번 포트 열기 (main.ts에서 여는 포트)
EXPOSE 3000

# node dist/main.js 실행
# RUN npm run start:prod 스크립트와 같음
CMD ["node","dist/main.js"]