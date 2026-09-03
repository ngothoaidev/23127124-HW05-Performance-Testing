const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const testPlanDir = path.join(root, 'test-plans');
const dataDir = path.join(root, 'test-data');
fs.mkdirSync(testPlanDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

const STUDENT_ID = '23127124';
const DATE = '20260903';

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function arg(name, value) {
  return `<elementProp name="${esc(name)}" elementType="Argument"><stringProp name="Argument.name">${esc(name)}</stringProp><stringProp name="Argument.value">${esc(value)}</stringProp><stringProp name="Argument.metadata">=</stringProp></elementProp>`;
}

function jsonHeaders(tokenVariable) {
  const auth = tokenVariable
    ? `<elementProp name="Authorization" elementType="Header"><stringProp name="Header.name">Authorization</stringProp><stringProp name="Header.value">Bearer \${${tokenVariable}}</stringProp></elementProp>`
    : '';
  return `<HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Headers" enabled="true"><collectionProp name="HeaderManager.headers"><elementProp name="Content-Type" elementType="Header"><stringProp name="Header.name">Content-Type</stringProp><stringProp name="Header.value">application/json</stringProp></elementProp>${auth}</collectionProp></HeaderManager><hashTree/>`;
}

function responseCodeAssertion(code = '200') {
  return `<ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Assert HTTP ${code}" enabled="true"><collectionProp name="Asserion.test_strings"><stringProp name="assert-code">${code}</stringProp></collectionProp><stringProp name="Assertion.custom_message">Unexpected HTTP response code</stringProp><stringProp name="Assertion.test_field">Assertion.response_code</stringProp><boolProp name="Assertion.assume_success">false</boolProp><intProp name="Assertion.test_type">8</intProp></ResponseAssertion><hashTree/>`;
}

function jsonExtractor(name, jsonPath, defaultValue = 'NOT_FOUND') {
  return `<JSONPostProcessor guiclass="JSONPostProcessorGui" testclass="JSONPostProcessor" testname="Extract ${esc(name)}" enabled="true"><stringProp name="JSONPostProcessor.referenceNames">${esc(name)}</stringProp><stringProp name="JSONPostProcessor.jsonPathExprs">${esc(jsonPath)}</stringProp><stringProp name="JSONPostProcessor.match_numbers">1</stringProp><stringProp name="JSONPostProcessor.defaultValues">${esc(defaultValue)}</stringProp></JSONPostProcessor><hashTree/>`;
}

function sampler({ name, method, endpoint, body = '', token = '', children = '' }) {
  const bodyArguments = body
    ? `<boolProp name="HTTPSampler.postBodyRaw">true</boolProp><elementProp name="HTTPsampler.Arguments" elementType="Arguments"><collectionProp name="Arguments.arguments"><elementProp name="" elementType="HTTPArgument"><boolProp name="HTTPArgument.always_encode">false</boolProp><stringProp name="Argument.value">${esc(body)}</stringProp><stringProp name="Argument.metadata">=</stringProp></elementProp></collectionProp></elementProp>`
    : `<elementProp name="HTTPsampler.Arguments" elementType="Arguments"><collectionProp name="Arguments.arguments"/></elementProp>`;
  return `<HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${esc(name)}" enabled="true">${bodyArguments}<stringProp name="HTTPSampler.domain"></stringProp><stringProp name="HTTPSampler.port"></stringProp><stringProp name="HTTPSampler.protocol"></stringProp><stringProp name="HTTPSampler.contentEncoding">UTF-8</stringProp><stringProp name="HTTPSampler.path">${esc(endpoint)}</stringProp><stringProp name="HTTPSampler.method">${esc(method)}</stringProp><boolProp name="HTTPSampler.follow_redirects">true</boolProp><boolProp name="HTTPSampler.auto_redirects">false</boolProp><boolProp name="HTTPSampler.use_keepalive">true</boolProp><boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp><stringProp name="HTTPSampler.embedded_url_re"></stringProp><stringProp name="HTTPSampler.connect_timeout">5000</stringProp><stringProp name="HTTPSampler.response_timeout">10000</stringProp></HTTPSamplerProxy><hashTree>${jsonHeaders(token)}${children}${responseCodeAssertion()}</hashTree>`;
}

function transaction(name, children) {
  return `<TransactionController guiclass="TransactionControllerGui" testclass="TransactionController" testname="${esc(name)}" enabled="true"><boolProp name="TransactionController.includeTimers">true</boolProp><boolProp name="TransactionController.parent">true</boolProp></TransactionController><hashTree>${children}</hashTree>`;
}

function loopController(loops) {
  return `<elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller" enabled="true"><boolProp name="LoopController.continue_forever">${loops === -1}</boolProp><stringProp name="LoopController.loops">${loops}</stringProp></elementProp>`;
}

function setupGroup() {
  const adminLogin = sampler({
    name: 'SETUP - Admin Login',
    method: 'POST',
    endpoint: '/api/login',
    body: '{"email":"admin@eshop.com","password":"Admin123!"}',
    children: jsonExtractor('admin_token', '$.token'),
  });
  const createCoupon = sampler({
    name: 'FR17 - Create Run Coupon',
    method: 'POST',
    endpoint: '/api/admin/coupons',
    token: 'admin_token',
    body: '{"code":"${coupon_code}","type":"fixed","discount_value":1000,"min_order_amount":0,"expired_at":"2099-12-31","max_uses_per_user":1000000}',
    children: `${jsonExtractor('created_coupon_id', '$.id')}<JSR223PostProcessor guiclass="TestBeanGUI" testclass="JSR223PostProcessor" testname="Store Coupon ID Globally" enabled="true"><stringProp name="cacheKey">true</stringProp><stringProp name="filename"></stringProp><stringProp name="parameters"></stringProp><stringProp name="script">if (vars.get('created_coupon_id') != 'NOT_FOUND') { props.put('coupon.id', vars.get('created_coupon_id')) }</stringProp><stringProp name="scriptLanguage">groovy</stringProp></JSR223PostProcessor><hashTree/>`,
  });
  const listCoupons = sampler({ name: 'FR17 - List Coupons', method: 'GET', endpoint: '/api/coupons', token: 'admin_token' });
  return `<SetupThreadGroup guiclass="SetupThreadGroupGui" testclass="SetupThreadGroup" testname="SETUP - FR17 Coupon Campaign" enabled="true"><stringProp name="ThreadGroup.on_sample_error">stoptest</stringProp>${loopController(1)}<stringProp name="ThreadGroup.num_threads">1</stringProp><stringProp name="ThreadGroup.ramp_time">1</stringProp><boolProp name="ThreadGroup.scheduler">false</boolProp><stringProp name="ThreadGroup.duration"></stringProp><stringProp name="ThreadGroup.delay"></stringProp><boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp></SetupThreadGroup><hashTree>${adminLogin}${createCoupon}${listCoupons}</hashTree>`;
}

function mainGroup(defaults) {
  const csv = `<CSVDataSet guiclass="TestBeanGUI" testclass="CSVDataSet" testname="CSV - Virtual User Data" enabled="true"><stringProp name="delimiter">,</stringProp><stringProp name="fileEncoding">UTF-8</stringProp><stringProp name="filename">\${__P(data.file,test-data/users.csv)}</stringProp><boolProp name="ignoreFirstLine">true</boolProp><boolProp name="quotedData">false</boolProp><boolProp name="recycle">true</boolProp><stringProp name="shareMode">shareMode.all</stringProp><boolProp name="stopThread">false</boolProp><stringProp name="variableNames">user_index,user_name,user_password,product_id,product_name,product_price,quantity,shipping_address</stringProp></CSVDataSet><hashTree/>`;
  const register = sampler({
    name: 'FR01 - Register Unique User',
    method: 'POST',
    endpoint: '/api/register',
    body: '{"name":"${user_name}","email":"${scenario}_${run_id}_${user_index}@perf.local","password":"${user_password}"}',
    children: jsonExtractor('registered_user_id', '$.id'),
  });
  const login = sampler({
    name: 'AUTH - Login Registered User',
    method: 'POST',
    endpoint: '/api/login',
    body: '{"email":"${scenario}_${run_id}_${user_index}@perf.local","password":"${user_password}"}',
    children: `${jsonExtractor('user_token', '$.token')}${jsonExtractor('user_id', '$.user.id')}`,
  });
  const onceOnly = `<OnceOnlyController guiclass="OnceOnlyControllerGui" testclass="OnceOnlyController" testname="Once per VU - Register and Login" enabled="true"><intProp name="LoopController.loops">1</intProp></OnceOnlyController><hashTree>${register}${login}</hashTree>`;
  const read = transaction('READ - Products',
    sampler({ name: 'READ - Product List', method: 'GET', endpoint: '/api/products' }) +
    sampler({ name: 'READ - Product Detail', method: 'GET', endpoint: '/api/products/${product_id}' }),
  );
  const cart = transaction('FR07 - Shopping Cart',
    sampler({ name: 'FR07 - Add Product to Cart', method: 'POST', endpoint: '/api/cart', token: 'user_token', body: '{"id":${product_id},"name":"${product_name}","price":${product_price},"quantity":${quantity}}' }) +
    sampler({ name: 'FR07 - View Cart', method: 'GET', endpoint: '/api/cart', token: 'user_token' }),
  );
  const checkout = transaction('TRANSACTIONAL - Coupon and Checkout',
    sampler({ name: 'Apply FR17-created Coupon', method: 'POST', endpoint: '/api/apply-coupon', body: '{"code":"${coupon_code}","total_amount":${product_price},"user_id":${user_id}}', children: jsonExtractor('coupon_id', '$.coupon_id') }) +
    sampler({ name: 'Checkout Order', method: 'POST', endpoint: '/api/checkout', token: 'user_token', body: '{"total_amount":${product_price},"shipping_address":"${shipping_address}"}', children: jsonExtractor('order_id', '$.orderId') }),
  );
  const thinkTime = `<TestAction guiclass="TestActionGui" testclass="TestAction" testname="Think Time 300-1000 ms per iteration" enabled="true"><intProp name="ActionProcessor.action">1</intProp><intProp name="ActionProcessor.target">0</intProp><stringProp name="ActionProcessor.duration">\${__Random(300,1000)}</stringProp></TestAction><hashTree/>`;
  const authenticatedFlow = `<IfController guiclass="IfControllerPanel" testclass="IfController" testname="Run only after successful login" enabled="true"><stringProp name="IfController.condition">\${__groovy(vars.get('user_token') != 'NOT_FOUND')}</stringProp><boolProp name="IfController.evaluateAll">false</boolProp><boolProp name="IfController.useExpression">true</boolProp></IfController><hashTree>${read}${cart}${checkout}</hashTree>`;
  return `<ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="${esc(defaults.scenario)} - End-to-End VUs" enabled="true"><stringProp name="ThreadGroup.on_sample_error">continue</stringProp>${loopController(-1)}<stringProp name="ThreadGroup.num_threads">\${__P(threads,${defaults.threads})}</stringProp><stringProp name="ThreadGroup.ramp_time">\${__P(ramp.seconds,${defaults.ramp})}</stringProp><boolProp name="ThreadGroup.scheduler">true</boolProp><stringProp name="ThreadGroup.duration">\${__P(duration.seconds,${defaults.duration})}</stringProp><stringProp name="ThreadGroup.delay">0</stringProp><boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp></ThreadGroup><hashTree>${csv}${onceOnly}${authenticatedFlow}${thinkTime}</hashTree>`;
}

function teardownGroup() {
  const login = sampler({
    name: 'TEARDOWN - Admin Login',
    method: 'POST',
    endpoint: '/api/login',
    body: '{"email":"admin@eshop.com","password":"Admin123!"}',
    children: jsonExtractor('teardown_admin_token', '$.token'),
  });
  const remove = sampler({
    name: 'FR17 - Delete Run Coupon',
    method: 'DELETE',
    endpoint: '/api/admin/coupons/${__property(coupon.id,0)}',
    token: 'teardown_admin_token',
  });
  return `<PostThreadGroup guiclass="PostThreadGroupGui" testclass="PostThreadGroup" testname="TEARDOWN - Remove Run Coupon" enabled="true"><stringProp name="ThreadGroup.on_sample_error">continue</stringProp>${loopController(1)}<stringProp name="ThreadGroup.num_threads">1</stringProp><stringProp name="ThreadGroup.ramp_time">1</stringProp><boolProp name="ThreadGroup.scheduler">false</boolProp><stringProp name="ThreadGroup.duration"></stringProp><stringProp name="ThreadGroup.delay"></stringProp><boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp></PostThreadGroup><hashTree>${login}${remove}</hashTree>`;
}

function listener(type, name) {
  const classes = {
    summary: ['SummaryReport', 'Summary Report'],
    aggregate: ['StatVisualizer', 'Aggregate Report'],
    graph: ['StatGraphVisualizer', 'Aggregate Graph'],
  };
  const [gui, label] = classes[type];
  return `<ResultCollector guiclass="${gui}" testclass="ResultCollector" testname="${esc(name || label)}" enabled="true"><boolProp name="ResultCollector.error_logging">false</boolProp><objProp><name>saveConfig</name><value class="SampleSaveConfiguration"><time>true</time><latency>true</latency><timestamp>true</timestamp><success>true</success><label>true</label><code>true</code><message>true</message><threadName>true</threadName><dataType>true</dataType><encoding>false</encoding><assertions>true</assertions><subresults>true</subresults><responseData>false</responseData><samplerData>false</samplerData><xml>false</xml><fieldNames>true</fieldNames><responseHeaders>false</responseHeaders><requestHeaders>false</requestHeaders><responseDataOnError>false</responseDataOnError><saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage><assertionsResultsToSave>0</assertionsResultsToSave><bytes>true</bytes><sentBytes>true</sentBytes><url>true</url><threadCounts>true</threadCounts><idleTime>true</idleTime><connectTime>true</connectTime></value></objProp><stringProp name="filename"></stringProp></ResultCollector><hashTree/>`;
}

function plan(defaults) {
  const variables = [
    arg('scenario', defaults.scenario),
    arg('run_id', '${__P(run.id,local)}'),
    arg('coupon_code', `HW05_${defaults.scenario}_\${run_id}`),
  ].join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="${STUDENT_ID} ${defaults.scenario} ${DATE}" enabled="true">
      <stringProp name="TestPlan.comments">AI-assisted and human-reviewed test plan. Workflow: FR17 campaign setup, FR01 registration/login, product reads, FR07 cart, coupon application, and checkout.</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">true</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true"><collectionProp name="Arguments.arguments">${variables}</collectionProp></elementProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
    <hashTree>
      <ConfigTestElement guiclass="HttpDefaultsGui" testclass="ConfigTestElement" testname="HTTP Request Defaults" enabled="true"><elementProp name="HTTPsampler.Arguments" elementType="Arguments"><collectionProp name="Arguments.arguments"/></elementProp><stringProp name="HTTPSampler.domain">\${__P(host,127.0.0.1)}</stringProp><stringProp name="HTTPSampler.port">\${__P(port,3000)}</stringProp><stringProp name="HTTPSampler.protocol">http</stringProp><stringProp name="HTTPSampler.contentEncoding">UTF-8</stringProp><stringProp name="HTTPSampler.path"></stringProp><stringProp name="HTTPSampler.connect_timeout">5000</stringProp><stringProp name="HTTPSampler.response_timeout">10000</stringProp></ConfigTestElement><hashTree/>
      ${setupGroup()}
      ${mainGroup(defaults)}
      ${teardownGroup()}
      ${listener(defaults.listener, `${defaults.viewName} - ${defaults.scenario}`)}
    </hashTree>
  </hashTree>
</jmeterTestPlan>
`;
}

const scenarios = [
  { scenario: 'Load', threads: 15, ramp: 30, duration: 180, listener: 'summary', viewName: 'Summary Report' },
  { scenario: 'Stress', threads: 400, ramp: 60, duration: 180, listener: 'aggregate', viewName: 'Aggregate Report' },
  { scenario: 'Spike', threads: 600, ramp: 2, duration: 90, listener: 'graph', viewName: 'Aggregate Graph' },
  { scenario: 'Soak', threads: 250, ramp: 60, duration: 600, listener: 'summary', viewName: 'Summary Report' },
];

for (const scenario of scenarios) {
  const filename = `${STUDENT_ID}_${scenario.scenario}_${DATE}.jmx`;
  fs.writeFileSync(path.join(testPlanDir, filename), plan(scenario), 'utf8');
}

const csvRows = ['user_index,user_name,user_password,product_id,product_name,product_price,quantity,shipping_address'];
const products = [
  ['1', 'iPhone 15 Pro Max', '30000000'],
  ['2', 'Samsung Galaxy S24 Ultra', '28000000'],
  ['3', 'MacBook Pro M3', '45000000'],
  ['4', 'Tai nghe AirPods Pro 2', '6000000'],
  ['5', 'Ban phim co Keychron Q1', '4000000'],
];
for (let i = 1; i <= 1000; i += 1) {
  const product = products[(i - 1) % products.length];
  csvRows.push(`${i},Perf User ${i},PerfTest123!,${product[0]},${product[1]},${product[2]},1,123 Nguyen Van Cu Q5 HCMC`);
}
fs.writeFileSync(path.join(dataDir, 'users.csv'), `${csvRows.join('\n')}\n`, 'utf8');

console.log(`Generated ${scenarios.length} JMeter plans and ${csvRows.length - 1} CSV rows.`);
