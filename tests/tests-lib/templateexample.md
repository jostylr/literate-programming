template example -- from the readme
---start:in
## Top

After the first compile, the numbers will be decremented, but the blocks
will not be evaluated.

    \1_":first"

    \2_":second"
    
    \1_":final"


This is now a template. We could use it as

[jack](# "store:| compile basic ")

[happy.txt](#jack "save:| compile great")
[sad.txt](# "save:| compile basic | compile grumpy")


# Basic

[first]()
    
    Greetings and Salutations

[final]()

    Sincerely,
    Jack

# Great

[second]()

    You are great.

# Grumpy

[second]()

    You are grumpy.

# Middle

[second]()

    You are okay.

## Another

    \_":first"

    \_"$2:second"
    
    \_":final"

[middle.txt](# "save:| sub $2, middle | compile basic")

---out:happy.txt
Greetings and Salutations

You are great.

Sincerely,
Jack
---out:sad.txt
Greetings and Salutations

You are grumpy.

Sincerely,
Jack
---out:middle.txt
Greetings and Salutations

You are okay.

Sincerely,
Jack
