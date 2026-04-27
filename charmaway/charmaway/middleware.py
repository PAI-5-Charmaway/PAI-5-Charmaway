class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        response["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response["X-Content-Type-Options"] = "nosniff"
        response["Cross-Origin-Resource-Policy"] = "same-origin"

        return response