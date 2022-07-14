class Single {
    constructor(options){
        this.id = options.id
    }

    static getInstanceof = (function () {
        let instance = null;
        let retFn = function(options){
            if(!instance){
                instance = new Single(options)
            }
            return instance
        }
        retFn.distroy = function(){
            console.log("执行 destroy ")
            instance = null
        }
        return retFn
    })()
}
export default Single