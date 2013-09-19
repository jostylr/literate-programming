# Black and White Hats

This is a literate program to implement strategies concerning the following problem:

>You have 100 people in a line. Each is wearing a black or white hat, but they don't know which. Each hat is equally likely to be on each person's head. They are put in a line, and they can see all the people after them. Starting with the first, they are each asked to make a guess as to which color hat they are wearing. They can agree on a strategy and they can hear all previous guesses. There is also one person in the line that may not follow the strategy. What is the optimal strategy for maximizing the number of right guesses?

## [hats.js](#hats.js "save: | jshint")

We are going to simulate this with a nodejs program. We first generate the line. Then we have a starting function followed by a function that works for the later ones, using the guesses and the next line. 

Our strategy will be the first person indicates the parity of the number of black hats in the line (black if odd, white if not). Then the rest will simply say "black" if the parity changes and white otherwise. The one who does not follow this will mess up the person following them, but that's it. At least that's the assertion. 


    n = 


## Make a line

We can start with