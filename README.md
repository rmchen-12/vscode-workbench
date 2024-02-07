# 包含两个包 
   - @hi/bridge-core 通讯的核心实现，为了减少发布，不会为他引入完整的 api ts 提示
   - @hi/bridge      依赖 @hi/bridge-core , 但是会提供完整的 api 声明，发布会较为频繁，业务方一般引入该包使用


# 发布流程

### 一个完整的预发布包大概要执行以下操作

changeset pre enter <tag>  进入预发布模式，用 alpha 就行，测完直接发正式
changeset                  确认发布包版本信息
changeset version          生成预发布版本号和changelog
changeset publish          发布预发布版本

### 预发布完成后正式发布

changeset pre exit  退出预发布模式
changeset           确认发布包版本信息
changeset version   生成预发布版本号和changelog
changeset publish   发布预发布版本
