var pryority = {

  generate: function(before, after) {

    var priority = "";
    char_max = "z";
    var min_length = Math.min(before.length, after.length);

    //console.log("min_length " + min_length);
    for(var i = 0; i < min_length; i++) {

      aChar = after.charAt(i);
      bChar = before.charAt(i);

      if(aChar == bChar) priority += bChar;
      else { // bChar has to be smaller

        if(this.charKey(bChar) + 1 < this.charKey(aChar)) {

          priority += this.incChar(bChar, 1);
          
          return priority;

        } // otherwise we keep going
        else {

          priority += bChar;

        }

      }

    }

    // if we are still here, it means 1 position is included into the other.

    if(after.length <= before.length) {

      for(var i = after.length; i < before.length; i++) {

        bChar = before.charAt(i);

        if(bChar != char_max) { // great, we can put the next character

          priority += this.incChar(bChar, 1);
          return priority;

        } // otherwise, keep going.
        else {


          priority += bChar;
          
        }

      }


      // if we are still here, 
      priority = priority + "b";
      
      return priority;


    }
    else {

      //console.log("After longer.");

      for(var i = before.length; i < after.length; i++) {

        aChar = after.charAt(i);
        console.log(aChar);

        if(aChar == "a") {

          priority += "a";
          //console.log("a found: " + priority);

        }
        else if(aChar == "b") {

          priority = priority + "a" + char_max;
          
          return priority;

        }
        else {

          //console.log("other found (" + aChar + "): " + this.incChar(aChar, -1));
          priority = priority + this.incChar(aChar, -1);
          
          return priority;

        }

      }


    }

  },

  hex: function(a) {

    alpha = "abcdefghijklmnopqrstuvwxyz";
    base = 0;
    result = "";
    
    do {

      if(a < 25) {

        result += alpha.charAt(a);
        if(alpha.charAt(a) == "a") result += "z";
        return result;

      }
      else {

        result += "z";
        a -= 26;

      }

    }
    while(true);
    
  },

  incChar: function(char, inc) {

    return this.keyChar(this.charKey(char) + inc);

  },

  alpha: "abcdefghijklmnopqrstuvwxyz",

  charKey: function(char) {

    for(var i = 0; i < this.alpha.length; i++) {

      if(this.keyChar(i) == char) return i;

    }

  },

  
  keyChar: function(i) {

    return this.alpha.charAt(i);

  }

}