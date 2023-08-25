const prod = {
    
}

const dev = {
    BASE_URL: 'http://localhost:8000',
    API_ENDPOINT: 'http://localhost:8000/sendMessage'
}

export const Config = process.env.NODE_ENV === 'development' ? dev : prod;