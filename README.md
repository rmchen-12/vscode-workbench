# 一个完整的预发布包大概要执行以下操作：

changeset pre enter <tag>  进入预发布模式，用 alpha 就行，测完直接发正式
changeset                  确认发布包版本信息
changeset version          生成预发布版本号和changelog
changeset publish          发布预发布版本

# 预发布完成后正式发布

changeset pre exit  退出预发布模式
changeset           确认发布包版本信息
changeset version   生成预发布版本号和changelog
changeset publish   发布预发布版本
