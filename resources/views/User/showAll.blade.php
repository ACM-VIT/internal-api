@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel panel-default">
                    <div class="panel-heading">Dashboard</div>

                    <div class="panel-body">
                        @foreach($users as $user)
                            <div class="card">
                                <div class="card-block">
                                    <h4 class="card-title">{{$user->name}}</h4>
                                    <p class="card-text">{{$user->bio}}</p>
                                </div>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item">{{$user->email}}</li>
                                    <li class="list-group-item">Position : {{$user->position}}</li>
                                    <li class="list-group-item">Role : {{$user->role}}</li>
                                </ul>
                                <div class="card-block">
                                    <a href="#" class="card-link">{{$user->contact}}</a>
                                    <a href="#" class="card-link">{{$user->regno}}</a>
                                </div>
                            </div>
                        @endforeach

                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
