@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-10 col-md-offset-1">
            <div class="panel panel-default">
                <div class="panel-heading">Dashboard</div>
                <div class="col-xs-12">
                    <ul class="nav nav-tabs">
                        <li role="presentation" data-toggle="collapse" data-target="#makeAnnouncement"><a href="#">Make
                                Announcement</a></li>
                        <li role="presentation" data-toggle="collapse" data-target="#createEvent"><a href="#">New
                                Event</a></li>
                        <li role="presentation" data-toggle="collapse" data-target="#callMeeting"><a href="#">Call
                                Meeting</a></li>
                    </ul>
                </div>
                <div class="col-xs-12 collapse" id="makeAnnouncement">
                    <form role="form" action="/admin/announce" method="POST">
                        <div class="form-group">
                            {{--Always put the csrf_field() in a form. This ensures the protection.--}}

                            {{csrf_field()}}
                            <label for="announcementSubject">Subject</label>


                            <input type="text" id="announcementSubject" name="subject" class="form-control">
                            <label for="announcementDetails">Details</label>
                            <textarea rows="8" class="form-control" id="announcementDetails" name="details"></textarea>
                            <button type="submit" class="btn btn-default">Post Announcement</button>
                        </div>
                    </form>
                </div>
                <div class="col-xs-12 collapse" id="callMeeting">
                    <form role="form" action="/admin/meeting/new" method="POST">
                        <div class="form-group">
                            {{--Always put the csrf_field() in a form. This ensures the protection.--}}

                            {{csrf_field()}}
                            <label for="announcementSubject">Subject</label>


                            <input type="text" id="meetingSubject" name="subject" class="form-control">
                            <label for="announcementDetails">Details</label>
                            <textarea rows="8" class="form-control" id="meetingDetails" name="details"></textarea>
                            <label for="timeOfMeeting">Timing From</label>

                            <input type="datetime" id="timeOfMeeting" name="timeStart" class="form-control"
                                   placeholder="{{\Carbon\Carbon::now()}}">

                            <label for="timeOfMeeting">Timing Upto</label>

                            <input type="datetime" id="timeOfMeeting" name="timeUpto" class="form-control"
                                   placeholder="{{\Carbon\Carbon::now()}}">

                            <label for="venueOfMeeting">Venue</label>
                            <input type="text" class="form-control" name="venue">
                            <br>
                            <button type="submit" class="btn btn-default">Post Meeting</button>
                        </div>
                    </form>
                </div>
                <div class="col-xs-12 collapse" id="createEvent">
                    <form role="form">
                        <div class="form-group">
                            <label for="eventName">Event Name</label>
                            <input type="text" id="eventName" class="form-control">
                            <label for="eventDate">Event Date</label>
                            <input type="date" id="eventDate" class="form-control">
                            <label for="eventDetails">Details</label>
                            <textarea rows="8" class="form-control" id="eventDetails"></textarea>
                            <br>
                            <button type="submit" class="btn btn-default">Create Event</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
    $('.nav-tabs').on('click', function () {
        $('.collapse').collapse('hide');
    });
</script>
@endsection
