import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import axios from 'axios';


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      teachers: [],
      students: [],
      teacherInput: '',
      studentInput: '',
    }

    this.handleTeacherChange = this.handleTeacherChange.bind(this);
    this.handleStudentChange = this.handleStudentChange.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);

  }

  componentDidMount() {
    axios.get(`http://localhost:8000/api/commonstudents?all=teachers`)
      .then(response => {
        console.log('response : ', response);
        this.setState({ teachers: response.data.teachers }, function () {
          console.log('-I-  New state with sample scooters :', this.state)
        })
      })
      .catch(error => {
        console.log('Error', error);
      })

    // axios.get(`http://localhost:8000/api/commonstudents?all=students`)
    //   .then(response => {
    //     console.log('response : ', response);
    //     this.setState({ students: response.data.students }, function () {
    //       console.log('-I-  New state with sample scooters :', this.state)
    //     })
    //   })
    //   .catch(error => {
    //     console.log('Error', error);
    //   })

  }

  handleTeacherChange(event) {
    this.setState({ teacherInput: event.target.value });
  }
  handleStudentChange(event) {
    this.setState({ studentInput: event.target.value });
  }


  handleSubmit(event) {
    alert('Registration: ' + this.state.teacherInput + ' has registered ' + this.state.studentInput);
    event.preventDefault();
    axios.post(`http://localhost:8000/api/register`, {
      teacher: this.state.teacherInput,
      students: [this.state.studentInput]
    })
      .then(response => {
        console.log('response : ', response);
        if (response.status === 204) {
          axios.get(`http://localhost:8000/api/commonstudents?all=students`)
            .then(response => {
              console.log('response : ', response);
              this.setState({ students: response.data.students, teacherInput: '', studentInput: '' }, function () {
                console.log('-I-  New state with sample scooters :', this.state)
              })
            })
            .catch(error => {
              console.log('Error', error);
            })
        }
        // this.setState({ students: response.data.students }, function () {
        //   console.log('-I-  New state with sample scooters :', this.state)
        // })
      })
      .catch(error => {
        console.log('Error', error);
      })
  }

  handleClick = (value) => {
    console.log('click', value)
    value = value.replace("@", "%40")
    axios.get(`http://localhost:8000/api/commonstudents?teacher=${value}`)
      .then(response => {
        console.log('response : ', response);
        this.setState({ students: response.data.students, teacherInput: '', studentInput: '' })
      })
      .catch(error => {
        console.log('Error', error);
      })
  }


  render() {
    const { students, teachers } = this.state;
    const listItems = students.map((email) =>
      <li>{email}</li>
    );
    const teachersList = teachers.map((email) =>
      <li onClick={(e) => this.handleClick(email)}>{email}</li>
    );

    return (
      <div className="App">
        <header className="App-header">
          <img
            src="https://thewesterlybarker.com/wp-content/uploads/2017/12/school-clip-art-85.jpg"
            alt="new"
          />

          <p>
            Register new students:
          </p>
          <form onSubmit={this.handleSubmit}>
            <label>
              Teacher e-mail:
          <input type="text" value={this.state.teacherInput} onChange={this.handleTeacherChange} />
            </label>
            <label>
              Student e-mail:
          <input type="text" value={this.state.studentInput} onChange={this.handleStudentChange} />
            </label>
            <input type="submit" value="Submit" />

          </form>

          <p>
            Registered Students:
          </p>
          <ul>{listItems}</ul>
          <label>Click on teacher to retrieve students</label>
          <ul>{teachersList}</ul>
        </header>
      </div>
    );
  }
}

export default App;
