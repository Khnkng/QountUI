/**
 * Created by seshu on 12-03-2016.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InterPolateUrlService = (function () {
    function InterPolateUrlService() {
        this.currObj = null;
        this.currObj = this;
    }
    InterPolateUrlService.prototype.interpolateUrl = function (url, params, data) {
        // Make sure we have an object to work with - makes the rest of the
        // logic easier.
        params = (params || {});
        data = (data || {});
        // Strip out the delimiter fluff that is only there for readability
        // of the optional label paths.
        url = url.replace(/(\(\s*|\s*\)|\s*\|\s*)/g, "");
        // Replace each label in the URL (ex, :userID).
        url = url.replace(/:([a-z]\w*)/gi, function ($0, label) {
            // NOTE: Giving "data" precedence over "params".
            return (InterPolateUrlService.popFirstKey(data, params, label) || "");
        });
        // Strip out any repeating slashes (but NOT the http:// version).
        url = url.replace(/(^|[^:])[\/]{2,}/g, "$1/");
        // Strip out any trailing slash.
        url = url.replace(/\/+$/i, "");
        return (url);
    };
    // I take 1..N objects and a key and perform a popKey() action on the
    // first object that contains the given key. If other objects in the list
    // also have the key, they are ignored.
    InterPolateUrlService.popFirstKey = function (object1, object2, objectN, key) {
        // Convert the arguments list into a true array so we can easily
        // pluck values from either end.
        var objects = Array.prototype.slice.call(arguments);
        // The key will always be the last item in the argument collection.
        var key = objects.pop();
        var object = null;
        // Iterate over the arguments, looking for the first object that
        // contains a reference to the given key.
        while (object = objects.shift()) {
            if (object.hasOwnProperty(key)) {
                return (this.popKey(object, key));
            }
        }
    };
    // I delete the key from the given object and return the value.
    InterPolateUrlService.popKey = function (object, key) {
        var value = object[key];
        delete (object[key]);
        return (value);
    };
    return InterPolateUrlService;
}());
exports.InterPolateUrlService = InterPolateUrlService;
