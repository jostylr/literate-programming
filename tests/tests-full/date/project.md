# First

This tests the date project. 


    _" | date 2011-05-03T22:10, addDays, num(3) "
    

[out.txt](# "save: | date format, ec('MMM DD, YYYY') 
    | join \n, _':others' ")

[others]()

    _" | date 2011-05-03T22:10 | date addDays, num(3) | date format,
        ec('MMM/DD/YYYY') |log "

    _"| date ec('Mar 27, 2009') | -format ec('Mo [Month] ddd, YYYY') |log "

    _" | echo 2011-05-03T22:10 | -addDays num(3) | date format,
        ec('MMM MM/DD/YYYY') "
 
    _" | echo -format(
                -addDays(
                    date( 2011-05-03T22:10 ), 
                    num(3) ), 
                ec('MMM MM/DD/YYYY') 
              ) "
        
## A couple of other dates

This checks the current date for passing in nothing. 

    _"| date | date format, ec('MM/DD/YY')  "

    _"| date format,  ec('Mo [Month] ddd, YYYY') "

[ignore.txt](# "save:")
