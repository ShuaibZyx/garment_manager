<template>
  <el-card>
    <div class="addUser">
      <div class="operation">
        <el-alert
          title="添加新用户"
          type="success"
          center
          :closable="false"
          style="width: 50%"
        />
      </div>
      <el-form
        ref="addUserFormRef"
        :model="addUserForm"
        :rules="addUserFormRules"
        label-width="auto"
      >
        <div class="necessary">
          <el-form-item label="电话" prop="account">
            <el-input
              v-model="addUserForm.account"
              clearable
              maxlength="11"
              size="small"
              placeholder="电话号码"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="addUserForm.password"
              size="small"
              maxlength="15"
              minlength="9"
              clearable
              show-password
              placeholder="登录密码"
            />
          </el-form-item>
        </div>
        <div class="choosable">
          <div class="left">
            <el-form-item label="昵称">
              <el-input
                v-model="addUserForm.nickname"
                maxlength="10"
                size="small"
                placeholder="昵称"
                clearable
              />
            </el-form-item>
            <el-form-item label="生日">
              <el-date-picker
                type="date"
                placeholder="选择日期"
                v-model="addUserForm.birthday"
                format="yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd"
                size="small"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="年龄" prop="age">
              <el-input
                v-model.number="addUserForm.age"
                max="150"
                type="number"
                size="small"
                placeholder="年龄"
              />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="addUserForm.gender">
                <el-radio :label="0"><i class="el-icon-male"> 男</i></el-radio>
                <el-radio :label="1"
                  ><i class="el-icon-female"> 女</i></el-radio
                >
              </el-radio-group>
            </el-form-item>
          </div>
          <div class="right">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="addUserForm.email"
                type="email"
                size="small"
                clearable
                placeholder="邮箱"
              />
            </el-form-item>
            <el-form-item label="地址" prop="city_code">
              <el-cascader
                style="width: 100%"
                v-model="addUserForm.city_code"
                :options="citys"
                size="small"
                filterable
                clearable
                :props="{ expandTrigger: 'hover' }"
              />
            </el-form-item>
            <el-form-item label="喜好" prop="favourite">
              <el-tag
                :key="favor"
                v-for="favor in addUserForm.favourite"
                closable
                :disable-transitions="false"
                @close="addNewFavorClose(favor)"
                style="margin-right: 10px"
              >
                {{ favor }}
              </el-tag>
              <!-- 输入tag名称所用的input -->
              <el-input
                class="input-new-sign"
                v-if="addFavoriteTag"
                v-model="newFavorTagName"
                :maxlength="10"
                clearable
                prefix-icon="el-icon-s-flag"
                ref="saveFavorInput"
                size="small"
                @keyup.enter.native="handleInputTagNameConfirm"
                @blur="handleInputTagNameConfirm"
              />
              <el-button
                v-else
                class="button-new-sign"
                size="small"
                @click="showInput"
                >+服装喜好</el-button
              >
            </el-form-item>
          </div>
        </div>
        <div class="btns">
          <el-button
            type="info"
            size="medium"
            round
            plain
            icon=" el-icon-close"
            @click="resetAddUserForm"
          >
            重置表单
          </el-button>
          <el-button
            type="primary"
            size="medium"
            round
            icon="el-icon-check"
            plain
            @click="addUser"
          >
            添加用户
          </el-button>
        </div>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import citys from "../../assets/js/citys";
export default {
  name: "AddUser",
  data() {
    return {
      //添加新用户的表单
      addUserForm: {
        account: "",
        password: "",
        nickname: "自由蝶",
        city_code: "",
        gender: 0,
        age: 18,
        favourite: [],
        birthday: "",
        email: "",
      },
      //添加新用户的表单验证规则
      addUserFormRules: {
        favourite: [
          {
            required: true,
            message: "请输入至少一个服装喜好标签",
            trigger: "blur",
          },
        ],
        account: [
          {
            required: true,
            pattern: /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8}$/,
            message: "不符合手机号码格式",
            trigger: ["blur", "change"],
          },
        ],
        email: [
          {
            required: false,
            type: "email",
            pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
            message: "邮箱格式不符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          {
            min: 9,
            max: 15,
            message: "长度在 9 到 15 个字符",
            trigger: ["blur", "change"],
          },
        ],
        gender: [
          { required: true, message: "请选择您的性别", trigger: "blur" },
        ],
        city_code: [
          { required: true, message: "请选择您的地址", trigger: "blur" },
        ],
        age: [
          {
            required: false,
            type: "number",
            max: 150,
            message: "年龄不符合规定",
            trigger: "blur",
          },
        ],
      },
      //级联选择器可选城市
      citys,
      //添加服装喜好标签输入框可见性
      addFavoriteTag: false,
      //新的服装喜好标签名
      newFavorTagName: "",
    };
  },
  methods: {
    //添加新的服装标签关闭时
    addNewFavorClose(sign) {
      this.addUserForm.favourite.splice(
        this.addUserForm.favourite.indexOf(sign),
        1
      );
    },

    //确定添加新服装喜好标签名时
    handleInputTagNameConfirm() {
      //重复标签限制
      if (this.addUserForm.favourite.includes(this.newFavorTagName)) {
        this.$message({
          message: "请勿添加重复标签",
          type: "info",
          center: true,
        });
        this.newFavorTagName = "";
        this.$refs.saveFavorInput.$refs.input.focus();
        return;
      }
      let newFavorTagName = this.newFavorTagName;
      if (newFavorTagName) {
        this.addUserForm.favourite.push(newFavorTagName);
      }
      this.addFavoriteTag = false;
      this.newFavorTagName = "";
    },

    //展示输入新服装标签名的输入框时
    showInput() {
      //最多存在五个标签
      if (this.addUserForm.favourite.length === 5) {
        this.$message({
          message: "最多添加五个标签",
          type: "info",
          center: true,
        });
        return;
      }
      this.addFavoriteTag = true;
      this.$nextTick((_) => {
        this.$refs.saveFavorInput.$refs.input.focus();
      });
    },

    //重置用户对象方法
    resetUserForm() {
      this.$refs.addUserFormRef.resetFields();
      Object.keys(this.addUserForm).forEach(
        (key) => (this.addUserForm[key] = "")
      );
      this.addUserForm.nickname = "自由蝶";
      this.addUserForm.gender = 0;
      this.addUserForm.age = 18;
      this.addUserForm.favourite = [];
    },

    //重置表单方法
    resetAddUserForm() {
      this.resetUserForm();
      this.$message({
        message: "重置成功!请重新输入",
        type: "success",
        center: true,
      });
    },

    //添加用户的方法
    async addUser() {
      this.$refs.addUserFormRef.validate(async (valid) => {
        //验证不通过直接返回
        if (!valid) return;
        var userObj = {};
        Object.assign(userObj, this.addUserForm);
        userObj.favourite = userObj.favourite.join("-");
        userObj.city_code = userObj.city_code.join("-");
        const { data: addUserRes } = await this.$http.post("user/add", {
          userObj,
        });
        this.resetUserForm()
        this.$message({
          message: `${
            addUserRes.code !== 200 ? "添加用户失败" : "添加用户成功!"
          }`,
          type: `${addUserRes.code !== 200 ? "error" : "success"}`,
          center: true,
        });
      });
    },
  },
};
</script>

<style lang="less">
.addUser {
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .operation {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 10px;
  }
  .el-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .el-form-item {
      width: 50%;
    }
    .necessary {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    }
    .choosable {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: flex-start;
      .left {
        width: 50%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
      }
      .right {
        width: 50%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
      }
    }
  }
  .btns {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
}
</style>
