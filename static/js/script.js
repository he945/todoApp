var tasksArray = [];
var notDoneCount = 0;

var Task = React.createClass({
  displayName: 'Task',

  getInitialState: function () {
    var component = this;
    return { isStrikeThrough: false, done: false, text: "" };
  },
  componentDidMount: function () {
    var component = this;
    var taskType = $.type(this.props.task);
    if (taskType === 'string') {
      var taskObj = JSON.parse(this.props.task);
      component.setState(taskObj);
    } else if (taskType === 'object') {
      component.setState(this.props.task);
    }
  },
  handleCheck: function (e) {
    React.render(React.createElement(Footer, null), document.getElementById("footer"));
    this.setState({ isStrikeThrough: this.state.isStrikeThrough });
    this.state.done = $(e.target).is(":checked");
    if ($(e.target).is(":checked")) {
      $(e.target).addClass("noteDone");
    } else {
      $(e.target).removeClass("noteDone");
    }
    $.post("/updateTask", { id: this.state.id, done: this.state.done }, function (data) {
      var taskData = JSON.parse(data);
      notDoneCount = taskData.notDoneCount;
      React.render(React.createElement(Footer, null), document.getElementById("footer"));
    });
  },
  render: function () {
    const isStrikeThrough = this.state.isStrikeThrough;
    var h3Style = noStrike;
    var backgroundColorStyle = whiteBackGround;
    var h3ClassName = "taskText";

    if (this.state.done) {
      h3Style = strikeStyle;
      backgroundColorStyle = blueBackGround;
      h3ClassName += " text-muted";
    }

    return React.createElement(
      'div',
      { style: backgroundColorStyle, className: 'taskDiv' },
      React.createElement(
        'h3',
        { style: h3Style, className: h3ClassName },
        React.createElement('input', { type: 'checkbox', checked: this.state.done, className: 'taskCheckbox', style: { marginRight: "10px" }, onClick: this.handleCheck }),
        this.state.text
      )
    );
  }
});

var Form = React.createClass({
  displayName: 'Form',

  handleSubmit: function (e) {
    e.preventDefault();
    var component = this;
    var taskInput = React.findDOMNode(this.refs.task);
    $.post("/addTask", { text: taskInput.value }, function (data) {
      var taskData = JSON.parse(data);
      component.props.addTask(taskData.task);
      taskInput.value = '';
      notDoneCount = taskData.notDoneCount;
      React.render(React.createElement(Footer, null), document.getElementById("footer"));
    });
  },
  handleKeyPress: function (e) {
    if (e.key == 'Enter') {
      handleSubmit(e);
    }
  },
  scrollToBottom: function (e) {
    e.preventDefault();
    const node = React.findDOMNode(document.getElementById("footer"));
    node.scrollIntoView({ behavior: "smooth" });
  },
  render: function () {
    return React.createElement(
      'form',
      { onSubmit: this.handleSubmit, style: { paddingLeft: "20px" } },
      React.createElement('input', { placeholder: ' What needs to be done?', id: 'inputBox', style: { marginRight: "10px", width: "310px", height: "40px" }, required: 'required', onKeyPress: this.handleKeyPress, ref: 'task' }),
      React.createElement(
        'button',
        { style: { width: "140px", height: "40px" } },
        'Add ToDo'
      ),
      React.createElement(
        'a',
        { style: { paddingLeft: '35px', verticalAlign: "bottom" }, href: '#', onClick: this.scrollToBottom, ref: 'top' },
        'Bottom of the page'
      )
    );
  }
});

var Main = React.createClass({
  displayName: 'Main',

  getInitialState: function () {
    return { tasks: tasksArray };
  },
  addTask: function (taskToAdd) {
    this.setState({ tasks: this.state.tasks.concat(taskToAdd) });
    React.render(React.createElement(Footer, null), document.getElementById("footer"));
  },
  render: function () {
    var tasks = this.state.tasks.map(function (task) {
      return React.createElement(Task, { task: task });
    });
    return React.createElement(
      'div',
      null,
      React.createElement(Form, { addTask: this.addTask }),
      React.createElement('hr', null),
      tasks
    );
  }
});

var Footer = React.createClass({
  displayName: 'Footer',

  handleAllDone: function (e) {
    e.preventDefault();

    $(".taskCheckbox").each(function () {
      if (!$(this).is(":checked")) {
        $(this).trigger("click");
      }
    });
  },
  scrollToTop: function (e) {
    e.preventDefault();
    const node = React.findDOMNode(document.getElementById("root"));
    node.scrollIntoView({ behavior: "smooth" });
  },
  render: function () {
    return React.createElement(
      'div',
      { style: { paddingLeft: "20px" } },
      { notDoneCount },
      ' items left',
      React.createElement(
        'a',
        { style: { paddingLeft: '25px' }, href: '#', id: 'markAllDone', onClick: this.handleAllDone },
        'Mark all as complete'
      ),
      React.createElement(
        'a',
        { style: { paddingLeft: '30px' }, href: '#', ref: 'bottom', onClick: this.scrollToTop },
        'Top of the page'
      )
    );
  }
});

const strikeStyle = {
  paddingTop: "0px",
  textDecoration: "line-through",
  paddingLeft: "15px"
};

const noStrike = {
  paddingTop: "0px",
  textDecoration: "none",
  paddingLeft: "15px"
};

const blueBackGround = {
  display: "inline-block",
  height: "60px",
  width: "100%",
  backgroundColor: "#F4F7FA",
  verticalAlign: "top"
};

const whiteBackGround = {
  display: "inline-block",
  height: "60px",
  width: "100%",
  backgroundColor: "#FFFFFF",
  verticalAlign: "top"
};

const inputStyle = {
  height: "100px",
  borderRadius: "30px 0px 0px 30px"
};

$('.titleText').css('padding-left', '20px');

$.get("/getTasks", function (data) {
  tasksArray = data.tasks;
  notDoneCount = data.notDoneCount;
  React.render(React.createElement(Main, null), document.getElementById("root"));
  React.render(React.createElement(Footer, null), document.getElementById("footer"));
});
