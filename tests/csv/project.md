This is a quick test of a csv parsing exercise. 

    _"some data | csv-parse | csv-transform _"f | funify" | csv-stringify"

[out.csv](# "save:")
    
## some data

An example csv 

    name, date, job
    John, 1/5/19, carpenter
    Jane, 2/3/17, astronaut


## f

This is the transformation function

    function (data) {
        return data.map(function (el) {
            return el.toUpperCase();
        });
    }

