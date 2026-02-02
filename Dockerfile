# Chọn Node version
FROM node:20-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy file package trước để cài dependencies
COPY package*.json ./

# Cài package
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build NestJS
RUN npm run build

# Mở port cho app
EXPOSE 3000

# Thêm dòng này để debug
RUN ls -la dist/ || echo "dist folder not found"

# Chạy app
CMD ["npm", "run", "start:prod"]
