import './App.css';
import InfiniteListModel from "./model";
import AndrzejekNavbar from "./AndrzejekNavbar";
import React, {useEffect, useRef, useState} from "react";
import {Container} from "react-bootstrap";

function Image({item}) {
    return <div style={{display: "flex", flexDirection: "column"}}>
        <img style={{
            borderWidth: 1,
            borderColor: "black",
            borderStyle: "solid",
            width: "100%",
        }} src={item.mediumPath}/>
        <a target="#" href={item.fullPath}>Duże</a>
    </div>
}

function isElemDisplayed(ref) {
    if (ref && ref.current) {
        const r = ref.current.getBoundingClientRect()
        const mid = window.screen.height / 2
        return r.y < mid && mid <= r.y + r.height
    } else {
        return false
    }
}

function useOnOver(ref, listener) {
    function overCheck() {
        if (isElemDisplayed(ref)) {
            listener()
        }
    }
    useEffect(() => {
        overCheck()
        window.addEventListener("scroll", overCheck)
        return () => {
            window.removeEventListener("scroll", overCheck)
        }
    })
}

function BlockItem({item, onOverItem}) {

    const ref = useRef(null)
    useOnOver(ref, () => onOverItem(item))

    return <Container ref={ref}>
            <h3>{item.dateCreated}</h3>
            {
                (item.mediumPath) ? <Image item={item}/> : <div/>
            }
        </Container>
}


function Block({model, onOverBlock, onOverItem}) {
    const ref = useRef(null)
    useOnOver(ref, () => onOverBlock(model))

    return <div style={{minHeight: 1000}} ref={ref}>
        {
            model.items.map(p => <BlockItem key={p.id} item={p} onOverItem={onOverItem}/>)
        }
    </div>
}

class InfiniteList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mounted: false,
            model: null,
        }
        this._scrollListener = null
        this._loadModelTimeout = null
        this._modelNeedsToBeUpdatedAfterScroll = false
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.date !== this.props.date) {
            this.state.model.jumpTo(this.props.date, (b) => {
                this.props.onOverItem(b.firstItem())
            })
        }
    }

    render() {
        return <div style={{marginTop: 70}}>
            {this.state.model ? <Container>
                {
                    this.state.model.blocks.map(bm =>
                        <Block key={bm.idx} model={bm} onOverBlock={b => this.onOverBlock(b)} onOverItem={this.props.onOverItem}/>
                    )
                }
            </Container> : <div/>}
        </div>
    }

    onOverBlock(b) {
        if (this._modelNeedsToBeUpdatedAfterScroll) {
            return
        }
        this._modelNeedsToBeUpdatedAfterScroll = true
        setTimeout(() => {
            this.state.model.onOverBlock(b)
            this._modelNeedsToBeUpdatedAfterScroll = false
        }, 200)

    }

    componentDidMount() {
        this.setState({
            ...this.state,
            mounted: true,
        })
        this._loadModelTimeout = setTimeout(() => {

            this.setState({
                ...this.state,
                model: new InfiniteListModel((c) => {
                    this.forceUpdate(c)
                }),
            })
        }, 50)
    }

    componentWillUnmount() {
        clearTimeout(this._loadModelTimeout)
    }

}

function App() {
    const [overItem, setOverItem] = useState(null)
    const [date, setDate] = useState(null)

    return <div>
        <AndrzejekNavbar date={overItem?.dateCreated} onChooseDate={d => setDate(d)}/>
        <InfiniteList date={date} onOverItem={i => setOverItem(i)}/>
    </div>
}

export default App;
