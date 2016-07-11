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
                    </ul>
                </div>
                <div class="col-xs-12 collapse" id="makeAnnouncement">
                    <form role="form">
                        <div class="form-group">
                            <label for="announcementSubject">Subject</label>
                            <input type="text" id="announcementSubject" class="form-control">
                            <label for="announcementDetails">Details</label>
                            <textarea rows="8" class="form-control" id="announcementDetails"></textarea>
                            <button type="submit" class="btn btn-default">Post Announcement</button>
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
                            <button type="submit" class="btn btn-default">Create Event</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
    $(document).on('click', function () {
        $('.collapse').collapse('hide');
    });
</script>
@endsection
