import { Day } from '../models/day.model';
import { Location } from '../models/location.model';
import moment from 'moment';
import map from 'async/map';
var isValid = require('mongoose').Types.ObjectId.isValid;




/*
 Get Days
 @query.location_id: optional, get days for a specific location
 @query.future_only: optional bool, get only future days
 */
export function getDays(req, res){
    var location_id = req.query.location_id;
    var future_only = req.query.future_only;
    var findObj = {};
    if(location_id) findObj.location_id = location_id;
    if(future_only) findObj.date = {$gt: new Date()};
    Day.find(findObj)
        .sort({date: 1})
        .exec(function(err, days){
            if (err) {
                res.status(500).send({err: 'could not query database'});
                return console.error(err);
            }
            map(days, (day, eCb)=>{
                day.getEventCount((err, count)=>{
                    if(err) return eCb(err);
                    eCb(null, {...day.toJSON(), eventCount: count});
                });
            }, (err, results)=>{
                if(err) res.status(500).send({err: 'could not query database'});
                res.send(results);
            });

        });
}

/*
 Create new
 @body.location_id: required, location that day is attached to
 @body.day: required, day object to create
 @body.capacity: optional, defaults to 8
 */
export function postDays(req, res){
    if(!req.body.location_id) return res.status(400).send({err: 'requires a location_id attribute in body to create day'});
    if(!isValid(req.body.location_id)) return res.status(400).send({err: 'invalid location_id'});
    if(!req.body.date) return res.status(400).send({err: 'requires a date attribute in body to create day'});
    if(!moment(req.body.date).isValid())return res.status(400).send({err: 'invalid date'});
    var day = new Day;
    day.date = req.body.date;
    day.capacity = req.body.capacity || 8;

    Location.findById(req.body.location_id, function(err, location){
        if (err) {
            res.status(500).send({err: 'could not query location by id'});
            return console.error(err);
        }
        if(!location){
            res.status(404).send({err: 'no location found for id'});
            return;
        }
        day.location_id = req.body.location_id;
        day.save(function(err, day){
            if (err) return res.status(500).send({err: 'could not save day object to database, did you send a valid date?'});
            res.send(day);
        });
    });
}

/*
 Get day by id
 */
export function getDayById(req, res) {
    var id = req.params.id;
    if (!isValid(id)) return res.status(400).send({err: 'invalid id'});
    Day.findById(id, function(err,day){
        if (err) return res.status(500).send({err: 'could not query database'});
        if(!day) return res.status(404).send({err: 'no day found for id:'+id});

        day.getEventCount(function(err, count){
            if (err) return res.status(500).send({err: 'could not query database'});
            res.send({...day.toJSON(), eventCount: count});
        });

    });

}

/*
 Edit day by id
 @body.date - new date to assign to day
 @body.capacity - new capacity
 @body.location_id - new location_id
 */
export function putDayById(req, res){
    var id = req.params.id;
    if(!isValid(id)) {
        res.status(400).send({err: 'invalid id'});
        return;
    }
    Day.findById(id, function(err,day){
        if (err) return res.status(500).send({err: 'could not query day by id'});
        if(!day) return res.status(404).send({err: 'no day found for id:'+id});

        if(req.body.date) day.date = req.body.date;
        if(req.body.capacity) day.capacity = req.body.capacity;
        if(req.body.location_id) day.location_id = req.body.location_id;

        day.save(function(err, day){
            if (err) return res.status(500).send({err: 'could not save day object to database, did you send an invalid date?'});
            res.send(day);
        });
    });
}


/*
 delete day by id, will also remove day from location[location_id].days array
 */
export function deleteDayById(req, res){
    var id = req.params.id;
    if(!isValid(id)) {
        res.status(400).send({err: 'invalid id'});
        return;
    }
    Day.findById(id, function(err,day){
        if (err) return res.status(500).send({err: 'could not query day by id'});
        if(!day) return res.status(404).send({err: 'no day found for id:'+id});

        day.remove(function(err, day){
            if (err) return res.status(500).send({err: 'could not delete day from database'});
            res.send(day);
        });
    });
}