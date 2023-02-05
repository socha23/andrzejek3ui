import React from "react";


/**
 * Keeps track of loaded blocks, loads new blocks in background.
 * Tracks block pixel height and scroll pos. Asks UI to update scroll pos in response for added / removed blocks.
 **
 * Model reflects the ordering on page, not the temporal order.
 *
 * Next, Previous, First and Last semantics is page position.
 */

const SERVER_URL = "http://localhost:8080"
//const SERVER_URL = "http://35.204.205.233:8080"

const MAX_BLOCKS = 3

let blockIdAutoinc = 0

class BlockModel {
    constructor(items = []) {
        this.idx = blockIdAutoinc++
        this.items = items
        this.hasNext = true
        this.hasPrev = true
    }

    firstItem() {
        if (this.items.length === 0) {
            return null
        } else {
            return this.items[0]
        }
    }

    lastItem() {
        if (this.items.length === 0) {
            return null
        } else {
            return this.items[this.items.length - 1]
        }
    }
}

class InfiniteListModel {
    constructor(onUpdate) {
        this.onUpdate = onUpdate
        this.blocks = []
        this.fetchNextBlock()
    }

    jumpTo(date, onSuccess = (newBlock) => {}) {
        this.blocks = []
        this.onUpdate(() => {
            this.fetchNextBlock(date, onSuccess)
        })
    }

    lastBlock() {
        return this.blocks.length === 0 ? null : this.blocks[this.blocks.length - 1]
    }

    firstBlock() {
        return this.blocks.length === 0 ? null : this.blocks[0]
    }

    fetchNextBlock(date = null, onSuccess = (newBlock) => {
    }) {
        const lastBlock = this.lastBlock()
        if (lastBlock && !lastBlock.hasNext) {
            return;
        }
        doFetch(buildAddr(SERVER_URL + "/before", lastBlock?.lastItem(), date))
            .then(json => {
                if (json["photos"].length > 0) {
                    if (this.blocks.length === MAX_BLOCKS) {
                        this.blocks.splice(0, 1)
                    }
                    const newBlock = new BlockModel(json["photos"])
                    this.blocks = [...this.blocks, newBlock]
                    this.onUpdate()
                    onSuccess(newBlock)
                } else {
                    if (lastBlock) {
                        lastBlock.hasNext = false
                    }
                }
            })
    }

    fetchPrevBlock() {
        const firstBlock = this.firstBlock()
        if (firstBlock && !firstBlock.hasPrev) {
            return;
        }
        doFetch(buildAddr(SERVER_URL + "/after", firstBlock?.firstItem()))
            .then(json => {
                if (json.photos.length > 0) {
                    if (this.blocks.length === MAX_BLOCKS) {
                        this.blocks.splice(MAX_BLOCKS - 1, 1)
                    }
                    const newBlock = new BlockModel(json.photos.reverse())
                    this.blocks = [newBlock, ...this.blocks]
                    this.onUpdate()
                } else {
                    if (firstBlock) {
                        firstBlock.hasPrev = false
                    }
                }
            })
    }

    onOverBlock(b) {
        let over = this.blocks.findIndex(x => x === b)
        if (over === -1) {
            // do nothing
        }
        if (over === 0) {
            this.fetchPrevBlock();
        }
        if (over === this.blocks.length - 1) {
            this.fetchNextBlock()
        }
    }
}

function buildAddr(addr, item, dateOverride = null) {
    if (item) {
        return addr + "?date=" + item.dateCreated + "&id=" + item.id
    } else if (dateOverride) {
        return addr + "?date=" + dateOverride
    } else {
        return addr
    }
}

function doFetch(addr) {
    return fetch(addr)
        .then(resp => {
            if (!resp.ok) {
                throw new Error("Fetch unsuccessful")
            } else {
                return resp.json()
            }
        })
}

export default InfiniteListModel;
