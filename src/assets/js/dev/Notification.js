/* 
Usage
n.log('Hello');
*/

class Notification { 
  constructor() {
    this.messages = [];
    let body = document.querySelector('body');
    let container = document.createElement("ul"); 
    container.classList.add('n-notification');
    body.appendChild(container);

    //Add CSS
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = `
      .n-notification {
        position: fixed;
        bottom: 5px;
        right: 5px;
        width: auto;
        height: auto;
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
        flex-direction: column;
      }
      .n-notification li {
        font-family: sans-serif;
        font-size: 12px;
        padding: 5px 10px;
        background: #eee;
        float: right;
        clear: both;
        border-radius: 10px;
        box-shadow: 0 0 1px rgba(0,0,0,0.4);
        max-width: 200px;
      }
      .n-notification li + li {
        margin-top: 5px;
      }
    `;
    document.head.appendChild(css);
  }
  mapNotifications(element) {
    return element.outerHTML;
  }
  log(message) {
    // Fallback
    console.log(message);
    let container = document.querySelectorAll('.n-notification')[0];
    let item = document.createElement('li'); 
    if( typeof message === 'object' ){
      item.innerHTML = JSON.stringify(message);
    } else {
      item.innerHTML = message;
    }
    this.messages.push(item);
    if( this.messages.length > 5 ){
      this.messages.shift();
    }
    let messagesResult = this.messages.map(this.mapNotifications).join('');
    container.innerHTML = messagesResult;
  }

}

window.n = new Notification;

export { Notification as default };