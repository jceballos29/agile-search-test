import * as React from 'react'
import 'src/core/assets/loader.css'
import HttpService from './http.service'
import 'src/core/utils/linq'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { History } from 'history'

interface CacheContentProps extends RouteComponentProps {
    idleTime?: number  // time in seconds
    cacheAlways?: boolean
    scope: string
}

interface CacheContentStatus {

}

export enum TimeType {
    Seconds = 0,
    Minutes = 1,
    Hour = 2,
    Days = 3,
    Custom = 4
}
export interface ExpirationTime {
    value: any,
    type: TimeType
}


class CacheService {
    private dictionaryKey: string
    private globalDictionaryKey: string
    private randomKey: string
    private idleTimetimer: any
    private props: CacheContentProps
    constructor(props: CacheContentProps) {
        this.currentlocation = props.location.pathname
        props.history.listen(() => this.listenHistory(props.history))
        this.lastlocation = ""
        this.props = props
        this.dictionaryKey = "CacheContentKey::" + props.scope;
        this.globalDictionaryKey = "CacheGlobalKey::" + props.scope;
        this.randomKey = new Date().getTime().toString()
    }

    private lastlocation: string
    private currentlocation: string

    listenHistory(history: any): void {
        this.lastlocation = this.currentlocation
        this.currentlocation = history.location.pathname
    }
    private generateItemKey() {
        return this.dictionaryKey + "::" + this.randomKey
    }
    private clearOnIdlePeriod() {
        if (this.props.idleTime) {
            clearTimeout(this.idleTimetimer)
            this.idleTimetimer = setTimeout(() => {
                this.clearCache()
            }, this.props.idleTime * 1000)
        }
    }

    private BuildItem(item: any, notClearOnBackward: boolean = false, cacheAlways: boolean = false): any {

        return {
            item: item,
            notClearOnBackward,
            cacheAlways,
            path: this.currentlocation
        }
    }
    //expire time in seconds
    private BuildGlobalItem(item: any, expiration: ExpirationTime): any {

        return {
            value: item,
            expire: this._fromTime(expiration)
        }
    }
    private _fromTime(time: ExpirationTime) {
        if (!time) return undefined
        let date = new Date()
        switch (time.type) {
            case 4:
                date.setTime(time.value)
                break
            case 3:
                date.setDate(date.getDate() + time.value)
                break
            case 2:
                date.setHours(date.getHours() + time.value)
                break
            case 1:
                date.setMinutes(date.getMinutes() + time.value)
                break
            case 0:
                date.setSeconds(date.getSeconds() + time.value)
                break
        }
        return date.getTime()
    }

    public saveWithCustomKey(key: string, item: any, notClearOnBackward: boolean = false, cacheAlways: boolean = false) {
        this.save(item, notClearOnBackward, cacheAlways, key)
    }
    public save(item: any, notClearOnBackward: boolean = false, cacheAlways: boolean = false, key: string = this.currentlocation) {
        this.clearOnIdlePeriod()
        var itemStore = this.BuildItem(item, notClearOnBackward, cacheAlways)
        window.localStorage.setItem(this.generateItemKey() + key, JSON.stringify(itemStore))
    }
    public isNavigationBackwards() {
        if (this.lastlocation.length == 0) return true
        return this.lastlocation.startsWith(this.currentlocation)
    }

    public saveLocalStorage(key: string, item: any) {
        window.localStorage.setItem(key, JSON.stringify(item))
    }

    public getLocalStorage(key: string) {
        var result = localStorage.getItem(key)
        if (result)
            return JSON.parse(result)
        return undefined
    }
    public saveGlobal(key: string, item: any, expiration: ExpirationTime) {
        var key = this.globalDictionaryKey + "::" + key
        window.localStorage.setItem(key, JSON.stringify(this.BuildGlobalItem(item, expiration)))
    }

    public getGlobal(key: string) {
        var key = this.globalDictionaryKey + "::" + key
        var result = localStorage.getItem(key)
        if (result) {
            var item = JSON.parse(result)
            if (!item.expire) {
                return item.value
            }
            if (item.expire >= new Date().getTime()) {
                return item.value
            }
            localStorage.removeItem(key)
        }
        return undefined
    }
    public getWithCustomKey(key: string, allowCacheOnNavigationBackwards: boolean = false) {
        return this.get(allowCacheOnNavigationBackwards, key)
    }
    public get(allowCacheOnNavigationBackwards: boolean = false, key: string = this.currentlocation) {
        var result = localStorage.getItem(this.generateItemKey() + key)
        if (!result) return undefined
        var ItemStore = JSON.parse(result)
        if (!this.props.cacheAlways)
            if (!allowCacheOnNavigationBackwards && !this.isNavigationBackwards())
                if (!ItemStore.notClearOnBackward && !ItemStore.cacheAlways) {
                    this.clearCacheByKey(key)
                    return undefined
                }
        return ItemStore.item
    }

    public isInCache(key: string = this.currentlocation) {
        var result = localStorage.getItem(this.generateItemKey() + key)
        if (result)
            return true
        return false
    }
    public clearCacheByKey(key: string = this.currentlocation) {
        localStorage.removeItem(this.generateItemKey() + key)
    }
    /// Clear all cache that match with the current path
    public clearCacheByPath() {
        var count = localStorage.length
        var todelete = []
        for (var i = 0; i < count; i++) {
            var key = localStorage.key(i)
            if (key?.startsWith(this.generateItemKey())) {
                var result = localStorage.getItem(key)
                if (!result) {
                    todelete.push(key)
                    continue
                }
                var ItemStore = JSON.parse(result)
                if (!ItemStore.path) {
                    todelete.push(key)
                    continue
                }
                if (ItemStore.path.startsWith(this.currentlocation) && ItemStore.path != this.currentlocation && !ItemStore.cacheAlways)
                    todelete.push(key)
            }
        }
        todelete.forEach(t => localStorage.removeItem(t))
    }
    public clearCache(includeCacheAlways: boolean = true) {
        var count = localStorage.length
        var todelete = []
        for (var i = 0; i < count; i++) {
            var key = localStorage.key(i)
            if (key?.startsWith(this.dictionaryKey)) {
                if (includeCacheAlways) {
                    todelete.push(key)
                    continue
                }
                var result = localStorage.getItem(key)
                if (!result) {
                    todelete.push(key)
                    continue
                }
                var ItemStore = JSON.parse(result)
                if (!ItemStore.cacheAlways)
                    todelete.push(key)
            }
        }
        todelete.forEach(t => localStorage.removeItem(t))
    }

    public clearGlobalExpiredCache() {
        var count = localStorage.length
        var todelete = []
        for (var i = 0; i < count; i++) {
            var key = localStorage.key(i)
            if (key?.startsWith("CacheGlobalKey::")) {
                var result = localStorage.getItem(key)
                if (!result) {
                    todelete.push(key)
                    continue
                }
                var ItemStore = JSON.parse(result)
                if (!ItemStore.expire) {
                    continue
                }
                if (ItemStore.expire >= new Date().getTime()) {
                    continue
                }
                todelete.push(key)
            }
        }
        todelete.forEach(t => localStorage.removeItem(t))
    }

    public clearAllCache() {
        window.localStorage.clear()
    }
}

let cacheService: CacheService

const { Provider, Consumer } = React.createContext<CacheService>(undefined as any)

class CacheContent extends React.Component<CacheContentProps, CacheContentStatus> {
    private cacheService: CacheService

    constructor(props: CacheContentProps) {
        super(props)
        this.cacheService = cacheService = new CacheService(this.props)
        this.state = {

        }

        this.beginCache = this.beginCache.bind(this)
    }

    UNSAFE_componentWillMount() {
        this.cacheService.clearCache()
        this.cacheService.clearGlobalExpiredCache()
    }

    private beginCache(): CacheService {
        return cacheService
    }

    public render() {

        return <Provider value={this.beginCache() as any}>{this.props.children}</Provider> || <div></div>
    }
}

export interface CacheProps {
    cache: CacheService
}

export function withCache<T extends React.ComponentType<any>>(Component: T) {
    // ...and returns another component...
    return function ComponentBoundWithAppContext(props: any) {
        // ... and renders the wrapped component with the current context!
        // Notice that we pass through any additional props as well
        return (
            <Consumer>
                {appContext => <Component {...props} cache={appContext} />}
            </Consumer>
        )
    }
}


export { cacheService }
export default withRouter(CacheContent)