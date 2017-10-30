/***************************************************************************************************************
    TimerTask.js
    
    This js file is designed for managing different timer/interval tasks working at the same time.
***************************************************************************************************************/

// TimerTask is a class for keeping info of a task to be acted in the standard interval
// Parameters
// name: name of the timer task
// interval: tigger time, unit: second, the least value can be 0.1 which means 100 ms
// times: total to trigger times, task is finished after the times trigger done
// data: other parameter data for trigger function, finishe function and/or stop function to use
// triggerFunc: call this func on each trigger
// finishFunc: call this func when task is finished
// stopFunc: call this func when taks is stopped
function TimerTask(name, interval, times, data, triggerFunc, finishFunc, stopFunc) {
    this.taskId = 0; // The Id of the task. When added to timertasks will be assigned a new value.
    this.name = name; // The name of the task
    this.data = data; // The data to use in triggerFunc/finishFunc/stopFunc
    this.interval = interval * 10; // Interval of seconds to trigger, window.SetInterval is at 0.1 second frequency
    this.timesAll = times; // Total trigger times, 0 means keeping trigger until this.stop = true
    // Notice: Must not call this.restart() in this.onTrigger()
    // Because this.stop will be set to true when automatically calling this.onFinish() when a task is finished
    this.triggerFunc = triggerFunc; // The function to trigger
    this.onTrigger = function () { 
        if (this.triggerFunc != null) {
            //console.log("Trigger task: " + this.taskId + " | " + this.name);
            this.triggerFunc(this);
        }
    }
    this.finishFunc = finishFunc; // The function to execute when finishing task
    this.onFinish = function () { 
        if (this.finishFunc != null) {
            //console.log("Finish task: " + this.taskId + " | " + this.name);
            this.finishFunc(this);
        }
    }
    this.stopFunc = stopFunc; // The function to execute when stopped
    this.onStop = function () { 
        if (this.stopFunc != null) {
            //console.log("Stop task: " + this.taskId + " | " + this.name);
            this.stopFunc(this);
        }
    }
    this.stop = false; // Set to true to stop the task
    this.finish = false; // Set to true when the task has been finished
    this.doneStopped = false; // Set to true after triggering stopFunc
    this.times = 0; // Triggered times, skipped when this.timesAll === 0
    this.tickcount = 0; // Keep track with this.interval and the interval of window.SetInterval

    this.onTick = function () {
        if (!this.stop && !this.finish) {
            this.tickcount++;
            if (this.tickcount === this.interval) {
                //console.log(this.name);
                // Trigger this.onTrigger() when this.interval seconds/10 pass by
                this.onTrigger();

                if (this.timesAll > 0) {
                    this.times++; // Add one to triggered times
                    if (this.times === this.timesAll) {
                        this.finish = true; // Set the finish flag when finished (triggered enough times)
                        this.onFinish(); // Call this.onFinish() when finishing the task
                    }
                }
                this.tickcount = 0; // Reset this.tickcount to start a new interval
            }
        }
    }

    // Restart a task with new time settings by reset other props such as reset this.stop to false
    this.restart = function (interval, times) {
        this.interval = interval * 10; // Interval of seconds to trigger, SetInterval is at 0.1 second frequency
        this.timesAll = times; // Total trigger times, 0 means keeping trigger until this.stop = true
        this.times = 0; // Triggered times, skipped when this.timesAll === 0
        this.tickcount = 0; // Keep track with this.interval and the interval of window.SetInterval
        this.stop = false; // Set true to stop the task. Set by outer controller.
        this.finish = false; // The state of whether the task has been finished. Set by inner controller.
        this.doneStopped = false; // Set to true after triggering stopFunc
    }
}

// A global timerTasks object to manage all the tasks to be timely executed
var timerTasks = {
    taskCount: 0,
    _tasks: [],

    addTask: function(task) {
        this.taskCount++;
        task.taskId = this.taskCount;
        this._tasks.push(task);
        console.log("Add task: " + task.taskId + " | " + task.name);
    },

    taskExists: function (name) {
        return this.indexOf(name) > -1;
    },

    indexOf: function (name) {
        for (var i = 0; i < this._tasks.length; i++) {
            if (this._tasks[i].name === name) return i;
        }
        return -1;
    },

    findTask: function (name) {
        var index = this.indexOf(name);
        if(index > -1) return this._tasks[index];
        else return null;
    },

    stopTask: function (name) {
        var task = this.findTask(name);
        if (task !== null) {
            task.stop = true;
        }
    },

    restartTask: function (name, interval, times, data) {
        var task = this.findTask(name);
        if (task !== null) {
            task.data = data;
            task.restart(interval, times);
            return true;
        } else return false;
    },

    timerTick: function () {
        for (var i = this._tasks.length - 1; i >= 0; i--) {
            var task = this._tasks[i];
            if (!task.stop && !task.finish) {
                task.onTick();
            }
            if (task.stop && (!task.doneStopped)) {
                task.onStop();
                task.doneStopped = true;
            }
        }
    },

    stopAll: function () {
        for (var i = this._tasks.length - 1; i >= 0; i--) {
            var task = this._tasks[i];
            console.log("task " + task.taskId + ": " + task.name);
            if ((!task.stop) && (!task.doneStopped) && task.onStop != null) {
                task.onStop();
                task.doneStopped = true;
                task.stop = true;
            }
        }
    }

};

// Timer class is designed to start and stop the timer (interval) and execute the tasks
function Timer(startImmediately) {
    this.intId = -1;
    this.startTimer = function () {
        this.intId = window.setInterval(function () {
            if (timerTasks.taskCount > 0) {
                timerTasks.timerTick();
            }
        }, 100);
    }
    this.stopTimer = function () {
        if (this.intId > -1) {
            this.stopAllTasks();
            clearInterval(this.intId);
            this.intId = -1;
        }
    }
    this.stopAllTasks = function () {
        if (timerTasks.taskCount > 0) {
            timerTasks.stopAll();
        }
    }
    if (startImmediately) {
        this.startTimer();
    }
}
