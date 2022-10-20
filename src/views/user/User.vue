<template>
  <el-card>
    <div class="user">
      <div class="operation">
        <el-button type="danger" size="small" plain @click="deleteSelectedUsers"
          >删除已选中</el-button
        >
        <el-alert
          title="用户信息管理"
          type="success"
          center
          :closable="false"
          style="width: 50%"
        />
        <el-button type="primary" size="small" plain @click="addUser"
          >添加用户</el-button
        >
      </div>
      <div class="table">
        <el-table
          :data="
            userList.filter(
              (data) =>
                !userSearch ||
                data.account.toLowerCase().includes(userSearch.toLowerCase())
            )
          "
          style="width: 100%"
          fit
          lazy
          :stripe="true"
          :border="true"
          :highlight-current-row="true"
          empty-text="暂无数据"
          ref="userTable"
          tooltip-effect="dark"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="expand">
            <template slot-scope="scope">
              <div class="expand_content">
                <el-descriptions title="用户地址信息" :column="2">
                  <el-descriptions-item label="用户编号">{{
                    scope.row.user_id
                  }}</el-descriptions-item>
                  <el-descriptions-item label="默认收获地址">
                    <span v-if="scope.row.defaultAddress === undefined">
                      暂无地址</span
                    >
                    <span v-else>
                      地址{{ scope.row.defaultAddress }}</span
                    ></el-descriptions-item
                  >
                  <el-descriptions-item label="用户地址" :span="2" />
                  <el-descriptions-item
                    :label="'地址' + (index + 1)"
                    :span="2"
                    v-for="(address, index) in scope.row.addresses"
                    :key="address.address_id"
                    >{{ address.city_code | cityFormat }}/{{ address.location }}

                    <el-button
                      type="danger"
                      size="mini"
                      plain
                      style="margin-left: 10px"
                      @click="
                        deleteUserAddress(
                          scope.row.addresses,
                          address.address_id
                        )
                      "
                      >删除</el-button
                    >
                    <el-button
                      v-if="address.state === 0"
                      type="primary"
                      size="mini"
                      plain
                      style="margin-left: 10px"
                      @click="
                        setUserDefaultAddress(
                          address.address_id,
                          scope.row.user_id
                        )
                      "
                      >设为默认地址</el-button
                    ></el-descriptions-item
                  >
                </el-descriptions>
              </div>
            </template>
          </el-table-column>

          <el-table-column type="selection" align="center" />

          <el-table-column
            type="index"
            label="序号"
            align="center"
            width="50"
          />

          <el-table-column
            label="电话号码(账号)"
            align="center"
            prop="account"
          />

          <el-table-column label="用户昵称" align="center" prop="nickname" />

          <el-table-column label="性别" align="center" width="60">
            <template slot-scope="scope">
              <el-tag type="primary">{{
                scope.row.gender | genderFormat
              }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="年龄" align="center" width="70">
            <template slot-scope="scope">
              <el-tag type="success">{{ scope.row.age }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="所在地区" align="center" width="220">
            <template slot-scope="scope">
              {{ scope.row.city_code | cityFormat }}
            </template>
          </el-table-column>

          <el-table-column label="喜好" align="center" width="200">
            <template slot-scope="scope">
              <el-tag
                type="primary"
                v-for="(favor, index) in scope.row.favourite"
                :key="index"
                style="margin: 0 5px 5px 0"
                >{{ favor }}</el-tag
              >
            </template>
          </el-table-column>

          <el-table-column align="center" width="300">
            <template slot="header">
              <el-input
                v-model="userSearch"
                size="mini"
                @keyup.enter.native="getUserList"
                @blur="getUserList"
                placeholder="输入电话号码进行搜索"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                plain
                @click="showEditUserDialog(scope.row)"
                >编辑</el-button
              >
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-plus"
                plain
                @click="showAddUserAddressDialog(scope.row.user_id)"
                >地址</el-button
              >
              <el-button
                v-if="scope.row.available === 1"
                type="warning"
                size="mini"
                plain
                @click="freezeUserAccount(scope.row.user_id)"
                >禁用</el-button
              >
              <el-button
                v-else
                type="success"
                size="mini"
                plain
                @click="thawUserAccount(scope.row.user_id)"
                >解冻</el-button
              >
              <el-popconfirm
                title="确定删除该用户?此操作不可逆"
                style="margin-left: 5px"
                @confirm="deleteUser(scope.row.user_id)"
              >
                <el-button slot="reference" type="danger" size="mini" plain
                  >删除</el-button
                >
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <div class="page">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page.pageNumber"
            :page-sizes="[8, 14, 22]"
            :page-size="page.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="page.total"
            background
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 编辑用户信息的Dialog -->
    <el-dialog
      :visible.sync="editUserVisible"
      width="40%"
      :close-on-click-modal="false"
      @close="resetEditUserForm"
      custom-class="editUserDialog"
    >
      <div slot="title" class="title">
        <i class="el-icon-edit"></i>
        <span> 编辑用户信息</span>
      </div>
      <el-form
        :model="editUserForm"
        label-width="auto"
        class="editUserForm"
        ref="editUserFromRef"
        :rules="editUserFormRules"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="editUserForm.nickname"
            autocomplete="off"
            size="small"
            maxlength="10"
            placeholder="昵称"
            clearable
          />
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="editUserForm.birthday"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
            size="small"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input
            v-model.number="editUserForm.age"
            max="150"
            type="number"
            size="small"
            placeholder="年龄"
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="editUserForm.gender">
            <el-radio :label="0"><i class="el-icon-male"> 男</i></el-radio>
            <el-radio :label="1"><i class="el-icon-female"> 女</i></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="editUserForm.email"
            type="email"
            clearable
            size="small"
            placeholder="邮箱"
          />
        </el-form-item>
        <el-form-item label="地址" prop="city_code">
          <el-cascader
            style="width: 100%"
            v-model="editUserForm.city_code"
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
            v-for="favor in editUserForm.favourite"
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
      </el-form>
      <div slot="footer" class="cartonDialogFooter">
        <el-button size="small" @click="editUserVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" size="small" @click="editUserInfo"
          >确 定</el-button
        >
      </div>
    </el-dialog>

    <!-- 添加用户地址的Dialog -->
    <el-dialog
      :visible.sync="addUserAddressDialogVisiable"
      width="40%"
      :close-on-click-modal="false"
      @close="resetAddUserAddressForm"
      custom-class="addUserAddressDialog"
    >
      <div slot="title" class="title">
        <i class="el-icon-edit"></i>
        <span> 新增用户地址信息</span>
      </div>
      <el-form
        :model="addUserAddressForm"
        label-width="auto"
        ref="addUserAddressRef"
        :rules="addUserAddressRules"
      >
        <el-form-item label="所在地区" prop="city_code">
          <el-cascader
            style="width: 100%"
            v-model="addUserAddressForm.city_code"
            :options="citys"
            size="small"
            filterable
            clearable
            :props="{ expandTrigger: 'hover' }"
          />
        </el-form-item>
        <el-form-item label="地区详细地址" prop="location">
          <el-input
            type="textarea"
            placeholder="请输入所在地区详细地址"
            v-model="addUserAddressForm.location"
            maxlength="200"
            size="small"
            show-word-limit
            clearable
            rows="4"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="cartonDialogFooter">
        <el-button size="small" @click="addUserAddressDialogVisiable = false"
          >取 消</el-button
        >
        <el-button type="primary" size="small" @click="addUserAddress"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import citys from "../../assets/js/citys";
export default {
  name: "User",
  data() {
    return {
      //用户列表
      userList: [],
      //已选中的用户列表
      userIdList: [],
      //搜索用户列表的条件
      userSearch: "",
      //编辑用户信息对话框可见性
      editUserVisible: false,
      //新增用户地址的dialog可见性
      addUserAddressDialogVisiable: false,
      //编辑用户信息的表单
      editUserForm: {
        nickname: "",
        city_code: "",
        gender: "",
        age: "",
        favourite: [],
        birthday: "",
        email: "",
      },
      //编辑用户信息的表单验证规则
      editUserFormRules: {
        favourite: [
          {
            required: true,
            message: "请输入至少一个服装喜好标签",
            trigger: "blur",
          },
        ],
        gender: [
          { required: true, message: "请选择您的性别", trigger: "blur" },
        ],
        city_code: [
          {
            required: true,
            message: "请选择您的地区",
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
      //新增用户收货地址表单
      addUserAddressForm: {
        city_code: "",
        location: "",
      },
      //新增用户收货地址表单验证规则
      addUserAddressRules: {
        city_code: [
          {
            required: true,
            message: "请选择您的地区",
            trigger: ["blur", "change"],
          },
        ],
        location: [
          { required: true, message: "请输入您的详细地址", trigger: "blur" },
        ],
      },
      //级联选择器可选城市
      citys,
      //添加服装喜好标签输入框可见性
      addFavoriteTag: false,
      //新的服装喜好标签名
      newFavorTagName: "",
      //分页所需对象
      page: {
        pageNumber: 1,
        pageSize: 8,
        total: 0,
      },
      //当前新加收获地址的用户
      currentUserId: "",
    };
  },
  methods: {
    //获取所有用户信息
    async getUserList() {
      this.getUserCountKey();
      const { data: userListRes } = await this.$http.post("user/infoes", {
        pageNumber: this.page.pageNumber,
        pageSize: this.page.pageSize,
        key: this.userSearch,
      });
      this.userList = userListRes.data;
      for (let i = 0; i < this.userList.length; i++) {
        this.userList[i].city_code = this.userList[i].city_code.split("-");
        this.userList[i].favourite = this.userList[i].favourite.split("-");
      }
    },

    //处理页面大小发生变化的方法
    handleSizeChange(newSize) {
      const temporaryTotal = this.page.pageSize * this.page.pageNumber;
      this.page.pageSize = newSize;
      this.page.pageNumber = temporaryTotal / this.page.pageSize + 1;
      this.getUserList();
    },

    //处理当前页码发生变化的方法
    handleCurrentChange(newPage) {
      this.page.pageNumber = newPage;
      this.getUserList();
    },

    //获取条件下所有用户数量
    async getUserCountKey() {
      const { data: userCountRes } = await this.$http.get(
        "user/count/" + this.userSearch
      );
      this.page.total = parseInt(userCountRes.data[0].total);
    },

    //处理选择按钮
    handleSelectionChange(value) {
      this.userIdList = value;
    },

    //冻结用户账号
    async freezeUserAccount(user_id) {
      const { data: freezeUserAccountRes } = await this.$http.post(
        "user/freeze",
        {
          user_id,
        }
      );
      this.userList.forEach((user) => {
        if (user.user_id === user_id) user.available = 0;
      });
      this.$message({
        message: `${
          freezeUserAccountRes.code !== 200 ? "冻结用户失败" : "冻结用户成功!"
        }`,
        type: `${freezeUserAccountRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },

    //解冻用户账号
    async thawUserAccount(user_id) {
      const { data: thawUserAccountRes } = await this.$http.post("user/thaw", {
        user_id,
      });
      this.userList.forEach((user) => {
        if (user.user_id === user_id) user.available = 1;
      });
      this.$message({
        message: `${
          thawUserAccountRes.code !== 200 ? "解冻用户失败" : "解冻用户成功!"
        }`,
        type: `${thawUserAccountRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },

    //删除单个用户
    async deleteUser(user_id) {
      const { data: deleteUserRes } = await this.$http.delete(
        "user/delete/" + user_id
      );
      if (this.userList.length - 1 === 0) this.page.pageNumber -= 1;
      this.getUserList();
      this.$message({
        message: `${
          deleteUserRes.code !== 200 ? "删除用户失败" : "删除用户成功!"
        }`,
        type: `${deleteUserRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },

    //删除已选中的用户行
    deleteSelectedUsers() {
      if (this.userIdList.length <= 0) {
        this.$message({
          message: "请选择用户列表行",
          type: "warning",
          center: true,
        });
        return;
      }
      this.$confirm("永久删除这些用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(async () => {
          var userIds = [];
          this.userIdList.forEach((user) => {
            userIds.push(user.user_id);
          });
          const { data: deleteUsersRes } = await this.$http.post(
            "user/deletes",
            {
              userIds,
            }
          );
          if (this.userList.length - userIds.length === 0) {
            this.page.pageNumber -= 1;
          }
          this.getUserList();
          this.$message({
            message: `${
              deleteUsersRes.code !== 200 ? "删除用户失败" : "删除用户成功!"
            }`,
            type: `${deleteUsersRes.code !== 200 ? "error" : "success"}`,
            center: true,
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
            center: true,
          });
        });
    },

    //添加新的服装标签关闭时
    addNewFavorClose(sign) {
      this.editUserForm.favourite.splice(
        this.editUserForm.favourite.indexOf(sign),
        1
      );
    },

    //确定添加新服装喜好标签名时
    handleInputTagNameConfirm() {
      //重复标签限制
      if (this.editUserForm.favourite.includes(this.newFavorTagName)) {
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
        this.editUserForm.favourite.push(newFavorTagName);
      }
      this.addFavoriteTag = false;
      this.newFavorTagName = "";
    },

    //展示输入新服装标签名的输入框时
    showInput() {
      //最多存在五个标签
      if (this.editUserForm.favourite.length === 5) {
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

    //展示编辑用户信息对话框并处理该用户数据
    showEditUserDialog(user) {
      this.editUserForm = this.$lodash.cloneDeep(user);
      this.editUserForm.birthday = this.$moment(
        this.editUserForm.birthday
      ).format("YYYY-MM-DD");
      this.editUserVisible = true;
    },

    //关闭dialog对话框时触发的方法
    resetEditUserForm() {
      this.$refs.editUserFromRef.resetFields();
      Object.keys(this.editUserForm).forEach(
        (key) => (this.editUserForm[key] = "")
      );
    },

    //编辑用户信息方法
    editUserInfo() {
      this.$refs.editUserFromRef.validate(async (valid) => {
        //验证不通过直接返回
        if (!valid) return;
        var userInfo = {};
        Object.assign(userInfo, this.editUserForm);
        userInfo.favourite = userInfo.favourite.join("-");
        userInfo.city_code = userInfo.city_code.join("-");
        const { data: editUserInfoRes } = await this.$http.post(
          "user/updateinfo",
          {
            userInfo: userInfo,
          }
        );

        this.editUserVisible = false;
        this.getUserList();
        this.$message({
          message: `${
            editUserInfoRes.code !== 200
              ? "更新用户信息失败"
              : "更新用户信息成功!"
          }`,
          type: `${editUserInfoRes.code !== 200 ? "error" : "success"}`,
          center: true,
        });
      });
    },

    //展示新增用户地址Dialog对话框并将user_id存入
    showAddUserAddressDialog(user_id) {
      this.addUserAddressDialogVisiable = true;
      this.currentUserId = user_id;
    },

    //添加用户的收货地址
    addUserAddress() {
      this.$refs.addUserAddressRef.validate(async (valid) => {
        //验证不通过直接返回
        if (!valid) return;
        var userAddressObj = this.addUserAddressForm;
        userAddressObj.user_id = this.currentUserId;
        userAddressObj.city_code = userAddressObj.city_code.join("-");
        const { data: addUserAddressRes } = await this.$http.post(
          "user/add/address",
          userAddressObj
        );
        this.addUserAddressDialogVisiable = false;
        this.getUserList();
        this.$message({
          message: `${
            addUserAddressRes.code !== 200
              ? "添加用户地址失败!"
              : "添加用户地址成功!"
          }`,
          type: `${addUserAddressRes.code !== 200 ? "error" : "success"}`,
          center: true,
        });
      });
    },

    //重置添加用户收货地址表单方法
    resetAddUserAddressForm() {
      this.$refs.addUserAddressRef.resetFields();
      Object.keys(this.addUserAddressForm).forEach(
        (key) => (this.addUserAddressForm[key] = "")
      );
    },

    //删除用户收货地址方法
    async deleteUserAddress(addresses, address_id) {
      const { data: deleteUserAddressRes } = await this.$http.post(
        "user/delete/address",
        {
          address_id,
        }
      );
      for (let i = 0; i < addresses.length; i++) {
        if (addresses[i].address_id === address_id) addresses.splice(i, 1);
      }
      this.$message({
        message: `${
          deleteUserAddressRes.code !== 200
            ? "删除用户地址失败!"
            : "删除用户地址成功!"
        }`,
        type: `${deleteUserAddressRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },

    //设置用户的默认收货地址
    async setUserDefaultAddress(address_id, user_id) {
      const { data: setUserDefaultAddressRes } = await this.$http.post(
        "user/address/default",
        {
          address_id,
          user_id,
        }
      );
      this.getUserList();
      this.$message({
        message: `${
          setUserDefaultAddressRes.code !== 200
            ? "设置用户默认地址失败!"
            : setUserDefaultAddressRes.msg
        }`,
        type: `${setUserDefaultAddressRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },

    //跳转到添加新用户页面
    addUser() {
      this.$router.push("/user/add");
    },
  },
  mounted() {
    this.getUserList();
  },
};
</script>
