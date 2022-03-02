//=============================================================================
// Info
//=============================================================================
 /*:
 * @plugindesc 自定义扩展方法。需要将其脚本添加到最前面
 * @author Lumnca
 *
 *
 */

String.prototype.translateBoolean = function(){
     if(this === 'true')return true;
     else return false;
}



String.prototype.getLineText = function(){
    return this.split("\n");
}


String.prototype.getKeyAndValue = function(){
    let datas = this.split(":");
    return {
        key : datas[0].trim(),
        value :datas[1].trim()
    }
}


String.prototype.getJSONdata = function(){
    if(this.indexOf("{")>-1 && this.indexOf("}")>-1){
        let start = this.indexOf("{");
        let end = this.indexOf("}");
        let json = this.slice(start,end+1);
        try{
            return JSON.parse(json);
        }
        catch{
            console.error("不规范JSON字符串")
            return null;
        }
    }
    else{
        return null;
    }
}

