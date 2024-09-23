//Comment field resets
//this code tells the way comments and talks are rendered and synchronized in your skill-sharing application


//1.Talk Class represents single talk in the system
class Talk {           
    constructor(talk,dispatch) {
        this.comments=elt("div")                                         //creating an empty div element to store comments
        //creatnig a dom structure for the talk including title,delete button,presenter,summary and comment form
        this.dom=elt("section",{className:"talk"},
                 elt("h2",null,talk.title, " ",elt("button", {
                    type:"button",
                    onclick: () => dispatch({
                        type:"deleteTalk",talk:talk.title
                    })
                 },"DELETE")),
                 elt("div",null,"by",elt("strong",null,talk.presenter)),
                 elt("p",null,talk.summary),
                 this.comments,                                           //placeholder for comment section
                 elt("form", {
                    onSubmit(event) {
                        event.preventDefault();
                        let form=event.target;
                        dispatch({type:"newComment",talk:talk.title,message:form.elements.comment.value})
                        form.reset();                                     // Reset the form after submission
                    }
                },
                elt("input",{type:"text",name:"comment"}), " ",           // Input field for the comment and a submit button
                elt("button", {type:"submit"}, "Add comment"))
        );

        // Sync the state of the talk to ensure all data is up-to-date
        this.syncState(talk);
    }
    //Method to update the DOM when the state of the talk changes
    syncState(talk) {
    this.talk = talk;                                                     // Store the updated talk object
    this.comments.textContent = "";                                       // Clear the existing comments in the DOM
    for (let comment of talk.comments) {                                  // Loop through each comment in the talk and render it
      this.comments.appendChild(renderComment(comment));
    }
  }
}


//2.SkillShareApp manages the entire list of talks and user interactions
class SkillShareApp {
    constructor(state, dispatch) {
      this.dispatch = dispatch;
      this.talkDOM = elt("div", {className: "talks"});                    // Create a div to hold all the talk components
      this.talkMap = Object.create(null);                                 // A map to keep track of talks by their titles for quick access
      this.dom = elt("div", null,                                         // Create the main DOM structure: user field, list of talks, and talk form
                     renderUserField(state.user, dispatch),               // Render user field to manage the current user's information
                     this.talkDOM,                                        // Div to hold the list of talks
                     renderTalkForm(dispatch));                           // Form for adding new talks
      this.syncState(state);                                              // Sync the state to display the initial talks
    }
    //method to sync the app's state with current list of talks
    syncState(state) {
        if (state.talks == this.talks) return;                            // If the list of talks hasn't changed, do nothing
        this.talks = state.talks;                                         // Update the local state of talks
//3.Loop through each talk in new state        
        for (let talk of state.talks) {                                  
          let found = this.talkMap[talk.title];                           // Check if the talk already exists in the talkMap
          if (found && found.talk.presenter == talk.presenter && found.talk.summary == talk.summary) { //if talk already exist
            found.syncState(talk);
          }                                                               // Otherwise, if the talk doesn't exist or has changed, create a new one
          else {
            if (found) found.dom.remove();                                // Remove the old DOM if a talk with the same title exists but has changed
            found = new Talk(talk, this.dispatch);                        // Create a new Talk component
            this.talkMap[talk.title] = found;                             // Add it to the talkMap
            this.talkDOM.appendChild(found.dom);                          // Append the new talk to the DOM
          }
        }
        for (let title of Object.keys(this.talkMap)) {                    // Remove talks that no longer exist in the updated state           
          if (!state.talks.some(talk => talk.title == title)) {           // If a talk title in talkMap doesn't exist in the current state, remove it from the DOM and the map
            this.talkMap[title].dom.remove();
            delete this.talkMap[title];
          }
        }
      }
    }











