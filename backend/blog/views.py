from rest_framework import viewsets
from .models import Task, User
from .serializers import TaskSerializer, UserSerializer
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.middleware.csrf import get_token
from rest_framework import permissions, status


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
 
class UserDataApi(APIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class LoginAPIView(APIView):
    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return Response(
                {
                    "success": True,
                    "message": "Login successful!",
                    "username": user.username,
                    "is_authenticated": user.is_authenticated,
                    "email": user.email,
                    "sessionid": request.session.session_key,
                    "quizlet_url": user.quizlet_url,
                }
            )
        else:
            return JsonResponse({'success': False, 'message': 'Invalid username or password.'}, status=400)
        


class CheckSessionAPI(APIView):
    """
    Check if the user is authenticated.
    """

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            csrf_token = get_token(request)
            return Response(
                {
                    "is_authenticated": request.user.is_authenticated,
                    "quizlet_url": request.user.quizlet_url,
                    "username": request.user.username,
                    "email": request.user.email,
                    "csrfToken": csrf_token,
                }
            )
        else:
            return Response(
                {"is_authenticated": request.user.is_authenticated},
                status=status.HTTP_401_UNAUTHORIZED,
            )