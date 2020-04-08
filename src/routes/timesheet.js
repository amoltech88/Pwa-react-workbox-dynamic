import React, { Component } from 'react';
import axios from "axios";
import { Button, Form, FormGroup, Label, Input, Spinner, } from 'reactstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import SpinnerLoading from "../components/loaders";

const queryString = require('query-string');

const url = "https://pwa-serv-notify.herokuapp.com/api/pwa/timesheets/";


class Timesheet extends Component {

    constructor(params) {

        super(params);
        this.state = {
            timesheetId: null,
            loading: false,
            timesheet: null,
            project: "",
            task: "",
            date: "",
            dateString: "",
            description: "",
            hours: "",
            status: "",
            projects: ["Progressive App", "GraphQL", "Chrome Chat Extension", "Online UPI", "Training and Dev"],
            tasks: ["Developer", "Testing", "POC", "Interview"],
            isEdit: false
        }

    }

    componentDidMount = () => {
        const { id } = queryString.parse(this.props.history.location.search);
        if (id) {
            this.getTimesheets(id);
            this.setState({ timesheetId: id });
        } else {
            this.setState({ isEdit: true });
        }

    }

    onChangeHandler = (name, value) => {
        this.setState({ [name]: value });
    }

    dropdownChangeHandler = () => {

        this.setState({ projectDropdownOpen: true })
        console.log("Abhijeet dro")
    }


    getSelectionList = (title, list, valueName) => {

        let { project, task } = this.state;
        return <FormGroup>
            <Label for="exampleSelect">{title}</Label>
            <Input type="select"
                name={valueName}
                value={valueName == "project" ? project : task}
                onChange={(e) => this.onChangeHandler(valueName, e.target.value)}
                id="exampleSelect">
                {list.map((e, i) => {
                    return <option key={i} value={e}>{e}</option>
                })
                }
            </Input>
        </FormGroup>
    }

    getInput = (title, value, valueName, type) => {


        return <FormGroup>
            <Label for={title}>{title}</Label>
            <Input type={type}
                name={valueName}
                value={value}
                onChange={(e) => this.onChangeHandler(valueName, e.target.value)}
            />
        </FormGroup>
    }

    getDateInput = (title, value) => {

        return <FormGroup>
            <Label for={title}>{title}</Label>
            <br />
            <DatePicker
                selected={value}
                onChange={this.dateChangeHandler}
            />
        </FormGroup>
    }

    dateChangeHandler = (date) => {
        let dObj = date.toString().split(' ');
        let dateString = `${dObj[2]} ${dObj[1]} ${dObj[3]}`;

        console.log(dateString);
        this.setState({ date: date, dateString: dateString })
    }

    submitTimesheet = (type) => {

        const { timesheetId, project, task, dateString, description, hours } = this.state;
        let timesheet = {
            project,
            task,
            date: dateString,
            description,
            hours,
            userid: "001",
            status: type === "save" ? "pending" : "submit"
        }


        // Send the call
        this.setState({ loading: true });
        if (timesheetId) {

            axios.put(`${url}/update/${timesheetId}`, timesheet)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                    this.setState({ loading: false });
                }).catch(er => {
                    this.setState({ loading: false });
                })

        } else {
            axios.post(`${url}/add`, timesheet)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                    this.setState({ loading: false });
                }).catch(er => {
                    this.setState({ loading: false });
                })
        }

        this.props.history.push('/');

    }

    getTimesheets = (id) => {

        this.setState({ loading: true });
        let searchURL = `${url}/${id}`;
        console.log("api call", searchURL);
        axios(
            searchURL
        ).then(res => {
            let result = res.data;
            let dateObj = new Date(result.date);
            this.setState({
                timesheet: result._id ? result : null, loading: false,
                project: result.project,
                task: result.task,
                date: dateObj,
                dateString: result.date,
                description: result.description,
                hours: result.hours,
                status: result.status
            });

            console.log("we have data ", res, "res-state-chagne", this.state)
        }).catch(err => {
            console.log("your network is not working!!");
            this.setState({ loading: false });
            // navigator.serviceWorker.ready.then(registration => {
            //     return registration.sync.register('get-pending-sync')
            //         .catch(function (err) {
            //             return err;
            //         })
            // })
        })
    }

    deleteTimesheet = (timesheetId) => {
        this.setState({ loading: true });
        axios.delete(`${url}/delete/${timesheetId}`)
            .then(res => {
                console.log(res);
                console.log(res.data);
                this.setState({ loading: false });
                this.props.history.push('/');
            }).catch(er => {
                this.setState({ loading: false });
            })

    }

    render() {
        const { timesheet, timesheetId, loading, isEdit, status } = this.state;

        return (
            <div>

                {loading && <SpinnerLoading />}

                {
                    timesheet && !isEdit ?
                        <div>
                            <h1 className="text-center"> Edit Timesheet</h1>
                            <div className="card">
                                <div className="container">
                                    <div>
                                        Project : {timesheet.project} <br />
                                    Task: {timesheet.task}<br />
                                    date:  {timesheet.task}<br />
                                    description:  {timesheet.description}<br />
                                    hours:  {timesheet.hours}<br />
                                    status:  {timesheet.status}<br />

                                    </div>
                                    {status == "pending" ? <div>
                                        <Button
                                            className="mr-2"
                                            color="primary" size="sm"
                                            onClick={() => this.onChangeHandler("isEdit", true)}>Edit</Button>
                                        <Button
                                            color="primary" size="sm"
                                            onClick={() => this.deleteTimesheet(timesheetId)}>Delete</Button>
                                    </div>
                                        : null}
                                </div>
                            </div>
                        </div>

                        : null}

                {isEdit && <div>
                    <h1 className="text-center">Add Timesheet</h1>
                    <div className="card">
                        <div className="container">
                            <div>
                                {this.getSelectionList("Project", this.state.projects, "project")}
                                {this.getSelectionList("Task", this.state.tasks, "task")}
                                {this.getDateInput("Date", this.state.date)}
                                {this.getInput("Description", this.state.description, "description", "textarea")}
                                {this.getInput("Hours", this.state.hours, "hours", "text")}

                                <div>

                                    <Button
                                        className="mr-2"
                                        color="primary" size="sm"

                                        onClick={() => this.submitTimesheet("save")} >Save</Button>
                                    <Button
                                        className="mr-2"
                                        color="primary" size="sm"
                                        onClick={() => this.submitTimesheet("submit")} >Submit</Button>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                }

            </div>
        )
    }
}

export default Timesheet
